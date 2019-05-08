import { errorText } from '../../../utils/i18n/common';

const errorCallout = text => ({
  calloutProps: {
    size: 'm'
  },
  iconType: 'cross',
  color: 'danger',
  title: errorText,
  text,
});

export default errorCallout;
