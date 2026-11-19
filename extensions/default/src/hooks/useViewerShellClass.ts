import { useSyncExternalStore } from 'react';
import type { ViewerShellService } from '@ohif/core';

type ShellClass = ReturnType<ViewerShellService['getShellClass']>;

/**
 * PROTOTYPE (OHIF-2799): the current shell class (`desktop`,
 * `tablet-landscape` or `tablet-portrait`). Re-renders the caller when the
 * viewer shell service reports a change.
 */
export default function useViewerShellClass(viewerShellService: ViewerShellService): ShellClass {
  const subscribe = (onChange: () => void) => {
    const { unsubscribe } = viewerShellService.subscribe(
      viewerShellService.EVENTS.SHELL_CLASS_CHANGED,
      onChange
    );

    return unsubscribe;
  };

  return useSyncExternalStore(subscribe, () => viewerShellService.getShellClass());
}
