import React, { useEffect, useState } from 'react';

import { InvestigationalUseDialog, Onboarding } from '@ohif/ui-next';
import { HangingProtocolService } from '@ohif/core';
import { useAppConfig } from '@state';
import LegacyChrome from './LegacyChrome';
import { useViewportGridHost, ViewportGridPortal, ViewportGridSlot } from './ViewportGridHost';
import useViewerShellClass from '../hooks/useViewerShellClass';

function ViewerLayout({
  // From Extension Module Params
  extensionManager,
  servicesManager,
  hotkeysManager,
  commandsManager,
  // From Modes
  viewports,
  ViewportGridComp,
  leftPanelClosed = false,
  rightPanelClosed = false,
  leftPanelResizable = false,
  rightPanelResizable = false,
  leftPanelInitialExpandedWidth,
  rightPanelInitialExpandedWidth,
  leftPanelMinimumExpandedWidth,
  rightPanelMinimumExpandedWidth,
}: withAppTypes): React.FunctionComponent {
  const [appConfig] = useAppConfig();

  const { hangingProtocolService, customizationService, viewerShellService } =
    servicesManager.services;
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(appConfig.showLoadingIndicator);

  const viewportGridHostElement = useViewportGridHost();
  const shellClass = useViewerShellClass(viewerShellService);

  const handleMouseEnter = () => {
    (document.activeElement as HTMLElement)?.blur();
  };

  const LoadingIndicatorProgress = customizationService.getCustomization(
    'ui.loadingIndicatorProgress'
  );

  /**
   * Set body classes (tailwindcss) that don't allow vertical
   * or horizontal overflow (no scrolling). Also guarantee window
   * is sized to our viewport.
   */
  useEffect(() => {
    document.body.classList.add('bg-background');
    document.body.classList.add('overflow-hidden');

    return () => {
      document.body.classList.remove('bg-background');
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const getComponent = id => {
    const entry = extensionManager.getModuleEntry(id);

    if (!entry || !entry.component) {
      throw new Error(
        `${id} is not valid for an extension module or no component found from extension ${id}. Please verify your configuration or ensure that the extension is properly registered. It's also possible that your mode is utilizing a module from an extension that hasn't been included in its dependencies (add the extension to the "extensionDependencies" array in your mode's index.js file). Check the reference string to the extension in your Mode configuration`
      );
    }

    return { entry };
  };

  useEffect(() => {
    const { unsubscribe } = hangingProtocolService.subscribe(
      HangingProtocolService.EVENTS.PROTOCOL_CHANGED,

      // Todo: right now to set the loading indicator to false, we need to wait for the
      // hangingProtocolService to finish applying the viewport matching to each viewport,
      // however, this might not be the only approach to set the loading indicator to false. we need to explore this further.
      () => {
        setShowLoadingIndicator(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [hangingProtocolService]);

  const getViewportComponentData = viewportComponent => {
    const { entry } = getComponent(viewportComponent.namespace);

    return {
      component: entry.component,
      isReferenceViewable: entry.isReferenceViewable,
      displaySetsToDisplay: viewportComponent.displaySetsToDisplay,
    };
  };

  const viewportComponents = viewports.map(getViewportComponentData);

  const loadingIndicator = showLoadingIndicator ? (
    <LoadingIndicatorProgress className="bg-background h-full w-full" />
  ) : null;

  return (
    <div>
      {shellClass !== 'desktop' ? (
        // PROTOTYPE (OHIF-2799): bare placeholder shell for both tablet shell
        // classes, just the viewport grid.
        <div
          className="bg-background relative flex w-full overflow-hidden"
          style={{ height: '100dvh' }}
          data-cy="viewer-shell"
          data-shell-class={shellClass}
        >
          {loadingIndicator}
          <ViewportGridSlot
            hostElement={viewportGridHostElement}
            className="flex h-full flex-1 flex-col"
          />
        </div>
      ) : (
        <LegacyChrome
          extensionManager={extensionManager}
          servicesManager={servicesManager}
          hotkeysManager={hotkeysManager}
          appConfig={appConfig}
          loadingIndicator={loadingIndicator}
          leftPanelClosed={leftPanelClosed}
          rightPanelClosed={rightPanelClosed}
          leftPanelResizable={leftPanelResizable}
          rightPanelResizable={rightPanelResizable}
          leftPanelInitialExpandedWidth={leftPanelInitialExpandedWidth}
          rightPanelInitialExpandedWidth={rightPanelInitialExpandedWidth}
          leftPanelMinimumExpandedWidth={leftPanelMinimumExpandedWidth}
          rightPanelMinimumExpandedWidth={rightPanelMinimumExpandedWidth}
          gridSlot={
            <ViewportGridSlot
              hostElement={viewportGridHostElement}
              className="flex h-full flex-1 flex-col"
            />
          }
        />
      )}
      {/* The grid is rendered once, here, and shown wherever the current chrome puts its slot. */}
      <ViewportGridPortal hostElement={viewportGridHostElement}>
        <div
          className="bg-background relative flex h-full flex-1 items-center justify-center overflow-hidden"
          onMouseEnter={handleMouseEnter}
        >
          <ViewportGridComp
            servicesManager={servicesManager}
            viewportComponents={viewportComponents}
            commandsManager={commandsManager}
          />
        </div>
      </ViewportGridPortal>
      <Onboarding tours={customizationService.getCustomization('ohif.tours')} />
      <InvestigationalUseDialog dialogConfiguration={appConfig?.investigationalUseDialog} />
    </div>
  );
}

export default ViewerLayout;
