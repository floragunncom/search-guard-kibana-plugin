import { successText } from '../../../utils/i18n/common';

const successCallout = text => ({
  calloutProps: {
    size: 'm'
  },
  closeButtonProps: {
    color: 'secondary'
  },
  iconType: 'user',
  color: 'success',
  title: successText,
  text,
});

export default successCallout;
