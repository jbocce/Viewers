window.config = {
  // default: '/'
  routerBasename: '/',
  // default: ''
  showStudyList: true,
  studyListFunctionsEnabled: true,
  servers: {
    dicomWeb: [
      {
        name: 'orthanc',
        wadoUriRoot: 'http://localhost/dicom-web',
        qidoRoot: 'http://localhost/dicom-web',
        wadoRoot: 'http://localhost/dicom-web',
        qidoSupportsIncludeField: true,
        supportsReject: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        requestOptions: {
          auth: 'admin:admin',
        },
      },
    ],
  },
  studyListFunctionsEnabled: true,
};
