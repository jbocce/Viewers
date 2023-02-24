const mpr = {
  id: 'default',
  locked: true,
  hasUpdatedPriorsInformation: false,
  name: 'mpr',
  createdDate: '2021-02-23T19:22:08.894Z',
  modifiedDate: '2022-10-04T19:22:08.894Z',
  availableTo: {},
  editableBy: {},
  protocolMatchingRules: [],
  imageLoadStrategy: 'nth',
  displaySetSelectors: {
    mprDisplaySet: {
      seriesMatchingRules: [
        {
          weight: 1,
          attribute: 'isReconstructable',
          constraint: {
            equals: {
              value: true,
            },
          },
          required: true,
        },
      ],
    },
  },
  stages: [
    {
      id: 'mpr3Stage',
      name: 'mpr',
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 2,
          columns: 2,
        },
      },
      viewports: [
        {
          viewportOptions: {
            toolGroupId: 'mpr',
            viewportType: 'volume',
            orientation: 'axial',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'voi',
                id: 'mpr',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'mprDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            toolGroupId: 'volume3d',
            viewportType: 'volume3d',
            orientation: 'sagittal',
          },
          displaySets: [
            {
              id: 'mprDisplaySet',
              options: {
                presetName: 'CT-Bone',
              },
            },
          ],
        },
        {
          viewportOptions: {
            toolGroupId: 'mpr',
            viewportType: 'volume',
            orientation: 'coronal',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'voi',
                id: 'mpr',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'mprDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            toolGroupId: 'mpr',
            viewportType: 'volume',
            orientation: 'sagittal',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'voi',
                id: 'mpr',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'mprDisplaySet',
            },
          ],
        },
      ],
    },
  ],
};

function getHangingProtocolModule() {
  return [
    {
      id: 'default',
      protocol: mpr,
    },
  ];
}

export default getHangingProtocolModule;
