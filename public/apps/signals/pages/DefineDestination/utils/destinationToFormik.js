import { omit } from 'lodash';
import { arrayToComboBoxOptions } from '../../../utils/helpers';
import { DESTINATION_TYPE } from '../../Destinations/utils/constants';
import * as DEFAULTS from './defaults';

export function buildFormikSlackDestination(destination) {
  return { ...DEFAULTS[DESTINATION_TYPE.SLACK], ...destination };
}

export function buildFormikEmailDestination(destination) {
  return {
    ...DEFAULTS[DESTINATION_TYPE.EMAIL],
    ...Object.keys(destination).reduce((acc, field) => {
      if (['default_cc', 'default_to', 'default_bcc', 'trusted_hosts'].includes(field)) {
        acc[field] = arrayToComboBoxOptions(destination[field]);
      } else {
        acc[field] = destination[field];
      }
      return acc;
    }, {})
  };
}

export function destinationToFormik(destination) {
  let formik;

  switch (destination.type) {
    case DESTINATION_TYPE.SLACK: {
      formik = buildFormikSlackDestination(destination);
      break;
    }
    default: {
      formik = buildFormikEmailDestination(destination);
    }
  }

  return formik;
}
