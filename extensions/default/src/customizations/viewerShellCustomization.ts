/**
 * PROTOTYPE (OHIF-2799): defaults for the viewer shell, read by the
 * `viewerShellService`.
 *
 * - `viewerShell.uiChoice`: `auto` picks the desktop or the tablet UI from the
 *   window and the device; `desktop` and `tablet` force that UI. This is the
 *   default for a site or a mode; a user's stored preference and the `?ui=`
 *   URL parameter both override it.
 * - `viewerShell.breakpoint`: a window narrower than this many CSS pixels gets
 *   the tablet UI when the choice is `auto`.
 */
export default {
  'viewerShell.uiChoice': 'desktop',
  'viewerShell.breakpoint': 1024,
};
