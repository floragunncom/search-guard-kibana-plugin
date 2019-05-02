import { i18nErrorText } from '../../../utils/i18n_nodes';

const errorCallout = text => ({
  calloutProps: {
    size: 'm'
  },
  iconType: 'cross',
  color: 'danger',
  title: i18nErrorText,
  text,
});

export default errorCallout;
