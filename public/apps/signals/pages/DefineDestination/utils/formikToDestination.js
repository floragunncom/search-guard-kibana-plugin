import { comboBoxOptionsToArray, filterEmptyKeys } from '../../../utils/helpers';
import { DESTINATION_TYPE } from '../../Destinations/utils/constants';

export function buildSlackDestination(formik) {
  return { ...formik };
}

export function buildEmailDestination(formik) {
  return Object.keys(formik).reduce((acc, field) => {
    if (['default_cc', 'default_to', 'default_bcc', 'trusted_hosts'].includes(field)) {
      acc[field] = comboBoxOptionsToArray(formik[field]);
    } else {
      acc[field] = formik[field];
    }

    return acc;
  }, {});
}

export function formikToDestination(formik) {
  let destination;

  switch (formik.type) {
    case DESTINATION_TYPE.SLACK: {
      destination = buildSlackDestination(formik);
      break;
    }
    default: {
      destination = buildEmailDestination(formik);
    }
  }

  return filterEmptyKeys(destination);
}
