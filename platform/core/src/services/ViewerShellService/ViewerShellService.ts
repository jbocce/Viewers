import { PubSubService } from '../_shared/pubSubServiceInterface';
import type ServicesManager from '../ServicesManager';

/**
 * PROTOTYPE (OHIF-2799): the viewer shell is the chrome around the viewport
 * grid (bars and panels). This service decides which shell the window gets.
 */

export const EVENTS = {
  SHELL_CLASS_CHANGED: 'event::viewerShellService:shellClassChanged',
};

/** Which shell the window gets. */
export type ShellClass = 'desktop' | 'tablet-landscape' | 'tablet-portrait';

/** `auto` applies the rule; `desktop` and `tablet` force that UI. */
export type UIChoice = 'auto' | 'desktop' | 'tablet';

export const UI_CHOICES: UIChoice[] = ['auto', 'desktop', 'tablet'];

/** Customization keys a site or a mode sets. */
export const CUSTOMIZATION_KEYS = {
  UI_CHOICE: 'viewerShell.uiChoice',
  BREAKPOINT: 'viewerShell.breakpoint',
};

/** The URL parameter that overrides the UI choice while it is in the address. */
export const UI_CHOICE_URL_PARAMETER = 'ui';

/** Holds the user's own values: `{ uiChoice?: UIChoice }`. */
export const USER_PREFERENCES_STORAGE_KEY = 'ohif:viewer-shell';

const DEFAULT_UI_CHOICE: UIChoice = 'desktop';
const DEFAULT_BREAKPOINT = 1024;

const ANY_POINTER_COARSE_QUERY = '(any-pointer: coarse)';
const PORTRAIT_QUERY = '(orientation: portrait)';

const isUIChoice = (value: unknown): value is UIChoice => UI_CHOICES.includes(value as UIChoice);

const canMatchMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const matches = (query: string) => canMatchMedia() && window.matchMedia(query).matches;

/** A window narrower than the breakpoint matches this query. */
const getNarrowWindowQuery = (breakpoint: number) => `(max-width: ${breakpoint - 0.02}px)`;

export default class ViewerShellService extends PubSubService {
  public static REGISTRATION = {
    name: 'viewerShellService',
    create: ({ servicesManager }): ViewerShellService => {
      return new ViewerShellService(servicesManager);
    },
  };

  private _servicesManager: ServicesManager;
  private _lastShellClass: ShellClass | undefined;
  private _watchedBreakpoint: number | undefined;
  private _narrowWindowQueryList: MediaQueryList | undefined;

  constructor(servicesManager: ServicesManager) {
    super(EVENTS);
    this._servicesManager = servicesManager;

    if (canMatchMedia()) {
      // The device gaining or losing a touchscreen, and the window changing shape.
      [ANY_POINTER_COARSE_QUERY, PORTRAIT_QUERY].forEach(query => {
        window.matchMedia(query).addEventListener('change', this._onInputChanged);
      });

      // The narrow-window listener is NOT attached here. Its query is built
      // from the breakpoint. The breakpoint is a customization that has no value
      // yet when this service is created and that a mode can change.
      // It is attached, and re-attached when the breakpoint changes, by _watchBreakpoint.
    }
  }

  /**
   * The shell class for the window as it is right now. Always computed from
   * the current inputs, so it is correct even before any change event fires
   * (for example once a mode's customizations have just been applied).
   *
   * Side effect: the first call, and any call after the breakpoint has
   * changed, (re)attaches the narrow-window listener (see _watchBreakpoint).
   * Calling it repeatedly is safe.
   */
  public getShellClass(): ShellClass {
    this._lastShellClass = this._computeShellClass();
    return this._lastShellClass;
  }

  private _computeShellClass(): ShellClass {
    this._watchBreakpoint(this.getBreakpoint());

    const uiChoice = this.getUIChoice();

    if (uiChoice === 'desktop') {
      return 'desktop';
    }

    const isTablet = uiChoice === 'tablet' || this._isNarrowWindow() || this._hasTouchscreen();

    if (!isTablet) {
      return 'desktop';
    }

    return matches(PORTRAIT_QUERY) ? 'tablet-portrait' : 'tablet-landscape';
  }

  /**
   * The UI choice in effect. The first of these that is set wins:
   * 1. the `ui` URL parameter;
   * 2. the user's preference in local storage;
   * 3. the site's customization;
   * 4. the mode's customization;
   * 5. the default.
   *
   * The order has no exceptions: a site's or a mode's value is a default that
   * the user's preference or the URL parameter overrides.
   */
  public getUIChoice(): UIChoice {
    return this._getUrlUIChoice() ?? this._getUserUIChoice() ?? this.getConfiguredUIChoice();
  }

  /**
   * The UI choice from the site's customization, else the mode's, else the
   * default. The customization service applies that order.
   */
  public getConfiguredUIChoice(): UIChoice {
    const value = this._getCustomizationValue(CUSTOMIZATION_KEYS.UI_CHOICE);
    return isUIChoice(value) ? value : DEFAULT_UI_CHOICE;
  }

  /** The window width, in CSS pixels, below which the tablet UI is used. */
  public getBreakpoint(): number {
    const value = this._getCustomizationValue(CUSTOMIZATION_KEYS.BREAKPOINT);
    return typeof value === 'number' && value > 0 ? value : DEFAULT_BREAKPOINT;
  }

  private _isNarrowWindow(): boolean {
    return matches(getNarrowWindowQuery(this.getBreakpoint()));
  }

  /**
   * The device has a touchscreen, whether or not a mouse, trackpad or keyboard
   * is attached as well. A touchscreen does not come and go with accessories,
   * so a device gets the same UI with or without them. Touchscreen laptops
   * count too: the tablet UI is the touch-friendly one.
   */
  private _hasTouchscreen(): boolean {
    return matches(ANY_POINTER_COARSE_QUERY);
  }

  private _getUrlUIChoice(): UIChoice | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const value = new URLSearchParams(window.location.search).get(UI_CHOICE_URL_PARAMETER);
    return isUIChoice(value) ? value : undefined;
  }

  private _getUserUIChoice(): UIChoice | undefined {
    try {
      const stored = JSON.parse(window.localStorage.getItem(USER_PREFERENCES_STORAGE_KEY));
      return isUIChoice(stored?.uiChoice) ? stored.uiChoice : undefined;
    } catch {
      // No stored value, unreadable JSON, or local storage is unavailable.
      return undefined;
    }
  }

  private _getCustomizationValue(customizationId: string): unknown {
    return this._servicesManager.services.customizationService?.getValue?.(customizationId);
  }

  /**
   * Listens for the window crossing the given breakpoint. The breakpoint can
   * differ between modes, so the listener follows the value in effect.
   *
   * Called every time the shell class is computed. It does nothing when the
   * breakpoint is the one already watched; otherwise it moves the listener to
   * a query for the new breakpoint. A change of breakpoint is therefore only
   * picked up the next time the shell class is read.
   */
  private _watchBreakpoint(breakpoint: number): void {
    if (!canMatchMedia() || breakpoint === this._watchedBreakpoint) {
      return;
    }

    this._narrowWindowQueryList?.removeEventListener('change', this._onInputChanged);
    this._narrowWindowQueryList = window.matchMedia(getNarrowWindowQuery(breakpoint));
    this._narrowWindowQueryList.addEventListener('change', this._onInputChanged);
    this._watchedBreakpoint = breakpoint;
  }

  /** Broadcasts only when the shell class differs from the one last handed out. */
  private _onInputChanged = (): void => {
    const previousShellClass = this._lastShellClass;
    const shellClass = this._computeShellClass();

    if (shellClass === previousShellClass) {
      return;
    }

    this._lastShellClass = shellClass;
    this._broadcastEvent(EVENTS.SHELL_CLASS_CHANGED, { shellClass, previousShellClass });
  };
}
