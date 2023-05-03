import AddGoogleDataSourceComponent from './components/AddGoogleDataSourceComponent';

function getCustomizationModule() {
  return [
    {
      name: 'addGoogleCloudDataSourceComponent',
      value: {
        id: 'addDataSourceComponent',
        component: AddGoogleDataSourceComponent,
      },
    },
  ];
}

export default getCustomizationModule;
