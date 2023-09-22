import React, { ReactElement } from 'react';
import { Enums } from '@cornerstonejs/tools';
import { toolNames } from './initCornerstoneTools';
import DicomUpload from './components/DicomUpload/DicomUpload';
import PerViewportWindowLevelPresetsComponent from './components/PerViewportWindowLevelPresets/PerViewportWindowLevelPresetsComponent';
import singleDisplaySetPresets from './components/PerViewportWindowLevelPresets/singleDisplaySetPresets';

const tools = {
  active: [
    {
      toolName: toolNames.WindowLevel,
      bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
    },
    {
      toolName: toolNames.Pan,
      bindings: [{ mouseButton: Enums.MouseBindings.Auxiliary }],
    },
    {
      toolName: toolNames.Zoom,
      bindings: [{ mouseButton: Enums.MouseBindings.Secondary }],
    },
    { toolName: toolNames.StackScrollMouseWheel, bindings: [] },
  ],
  enabled: [{ toolName: toolNames.SegmentationDisplay }],
};

function getCustomizationModule({ servicesManager }) {
  return [
    {
      name: 'cornerstoneDicomUploadComponent',
      value: {
        id: 'dicomUploadComponent',
        component: DicomUpload,
      },
    },
    {
      name: 'default',
      value: [
        {
          id: 'cornerstone.overlayViewportTools',
          tools,
        },
        {
          id: 'cornerstone.perViewportWindowLevelPresetsComponent',
          component: (props): ReactElement => {
            return (
              <PerViewportWindowLevelPresetsComponent
                {...props}
                servicesManager={servicesManager}
              ></PerViewportWindowLevelPresetsComponent>
            );
          },
        },
        {
          id: 'cornerstone.windowLevelPresets.singleDisplaySet',
          presets: singleDisplaySetPresets,
        },
      ],
    },
  ];
}

export default getCustomizationModule;
