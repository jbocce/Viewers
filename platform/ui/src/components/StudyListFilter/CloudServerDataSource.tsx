import React, { ReactElement, useState } from 'react';
import { Button, Input } from '../';

function CloudServerDataSource({ onDataSourceAdd }): ReactElement {
  const [name, setName] = useState('googleDataSource');
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div>Name:</div>
        <Input
          id="cloudServerDataSourceName"
          className="border-primary-main mt-2 bg-black"
          type="text"
          containerClassName="mr-2"
          value={name}
          onChange={event => {
            setName(event.target.value);
          }}
        />
      </div>
      <div className="flex">
        <div>URL:</div>
        <Input
          id="cloudServerDataSourceUrl"
          className="border-primary-main mt-2 bg-black"
          type="text"
          containerClassName="mr-2"
          value={url}
          onChange={event => {
            setUrl(event.target.value);
          }}
        />
      </div>
      <Button
        variant="contained"
        color="primary"
        disabled={false}
        className="ml-auto"
        onClick={() => {
          onDataSourceAdd({
            friendlyName: 'Google dcmjs DICOMWeb Server',
            namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
            sourceName: name,
            configuration: {
              name,
              wadoUriRoot: url,
              qidoRoot: url,
              wadoRoot: url,
              qidoSupportsIncludeField: true,
              imageRendering: 'wadors',
              thumbnailRendering: 'wadors',
              enableStudyLazyLoad: true,
              supportsFuzzyMatching: true,
              supportsWildcard: false,
            },
          });
        }}
      >
        {'Ok'}
      </Button>
    </div>
  );
}

export default CloudServerDataSource;
