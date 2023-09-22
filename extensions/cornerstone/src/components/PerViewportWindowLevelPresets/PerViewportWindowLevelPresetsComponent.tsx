import React, { useCallback, useRef, useState } from 'react';
import { ReactElement } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { ServicesManager } from '@ohif/core';

type PerViewportWindowLevelPresetsComponentProps = {
  viewportId: string;
  servicesManager: ServicesManager;
};

function PerViewportWindowLevelPresetsComponent({
  viewportId,
  servicesManager,
}: PerViewportWindowLevelPresetsComponentProps): ReactElement {
  const [showPresetsPopup, setShowPresetsPopup] = useState(false);

  const showPopupComponent = useRef<HTMLElement>(null);

  const showPopupClickHandler = useCallback(
    event => {
      if (!showPresetsPopup) {
        // we are about to display the popup so
      }
    },
    [showPresetsPopup, setShowPresetsPopup]
  );

  const getPopupPositioning = () => {
    if (!showPopupComponent?.current) {
      return {};
    }

    const bbox = showPopupComponent.current.getBoundingClientRect();
    const top = bbox.bottom + 5;
    const left = bbox.left;

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  };
  return (
    <OutsideClickHandler
      onOutsideClick={() => setShowPresetsPopup(false)}
      disabled={!showPresetsPopup}
    >
      <div
        ref={showPopupComponent}
        className="bg-primary-active relative h-[16px] w-[16px] cursor-pointer"
        onClick={() => setShowPresetsPopup(isShowing => !isShowing)}
      >
        {showPresetsPopup && (
          <div
            className="bg-primary-active fixed z-[1000] h-[100px] w-[100px]"
            style={getPopupPositioning()}
          ></div>
        )}
      </div>
    </OutsideClickHandler>
  );
}

export default PerViewportWindowLevelPresetsComponent;
