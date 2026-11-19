import React, { useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * PROTOTYPE (OHIF-2799): keeps the viewport grid mounted while the chrome
 * around it (header, side panels, toolbars) is swapped out.
 *
 * The grid is rendered once, through a portal, into a DOM node that lives as
 * long as the viewer layout. Each chrome renders a `ViewportGridSlot` where
 * the grid should appear; mounting a slot moves the host node into it. React
 * never unmounts the grid, so the viewports inside it are not re-created.
 */

/**
 * Creates the one DOM node that holds the viewport grid for the life of the
 * viewer layout.
 */
export function useViewportGridHost(): HTMLDivElement {
  const [hostElement] = useState(() => {
    const element = document.createElement('div');
    element.className = 'flex h-full w-full';
    element.dataset.cy = 'viewport-grid-host';
    return element;
  });

  return hostElement;
}

type ViewportGridPortalProps = {
  hostElement: HTMLDivElement;
  children: React.ReactNode;
};

/**
 * Renders the viewport grid into the host node. Render this once, at a fixed
 * place in the viewer layout and AFTER the chrome that contains the slot, so
 * that the host node is attached to the document before the grid's own
 * layout effects run.
 */
export function ViewportGridPortal({ hostElement, children }: ViewportGridPortalProps) {
  return createPortal(children, hostElement);
}

type ViewportGridSlotProps = {
  hostElement: HTMLDivElement;
  className?: string;
};

/**
 * Marks where the viewport grid sits inside the current chrome. Mounting a
 * slot moves the host node (and with it the live viewport grid) into the slot.
 */
export function ViewportGridSlot({ hostElement, className }: ViewportGridSlotProps) {
  const attachHostElement = (slotElement: HTMLDivElement | null) => {
    if (slotElement && hostElement.parentElement !== slotElement) {
      slotElement.appendChild(hostElement);
    }
  };

  return (
    <div
      ref={attachHostElement}
      className={className}
    />
  );
}
