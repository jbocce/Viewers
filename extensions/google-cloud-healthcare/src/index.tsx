import { Types } from '@ohif/core';
import { id } from './id';
import getCustomizationModule from './getCustomizationModule';

const googleCloudHealthcareExtension: Types.Extensions.Extension = {
  /**
   * Only required property. Should be a unique value across all extensions.
   */
  id,

  getCustomizationModule,
};

export default googleCloudHealthcareExtension;
