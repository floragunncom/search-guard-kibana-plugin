import { startCase } from 'lodash';
import { SEVERITY_ORDER } from '../../../utils/constants';

export const SEVERITY_OPTIONS = [
  { value: SEVERITY_ORDER.ASCENDING, text: startCase(SEVERITY_ORDER.ASCENDING) },
  { value: SEVERITY_ORDER.DESCENDING, text: startCase(SEVERITY_ORDER.DESCENDING) }
];
