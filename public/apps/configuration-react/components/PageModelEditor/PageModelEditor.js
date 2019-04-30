import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import 'brace/theme/github';
import 'brace/mode/javascript';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import { EuiCodeEditor } from '@elastic/eui';
import FormikSwitch from '../FormControls/FormikSwitch';
import { i18nShowJson } from '../../utils/i18n_nodes';

const renderEditor = ({ setOptions, value, onChange, ariaLabel, isReadOnly }) => (
  <EuiCodeEditor
    isReadOnly={isReadOnly}
    mode="javascript"
    theme="github"
    width="100%"
    value={value}
    onChange={onChange}
    setOptions={setOptions}
    aria-label={ariaLabel}
  />
);

const PageModelEditor = ({
  setOptions = { fontSize: '14px' },
  value = '',
  onChange,
  ariaLabel = 'Model Preview',
  isReadOnly = true,
  showJson = false
}) => (
  <Fragment>
    <FormikSwitch
      formRow
      elementProps={{
        label: i18nShowJson
      }}
      name="showJson"
    />
    {showJson ? renderEditor({ setOptions, value, onChange, ariaLabel, isReadOnly }) : null}
  </Fragment>
);

PageModelEditor.propTypes = {
  setOptions: PropTypes.object,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  ariaLabel: PropTypes.string,
  isReadOnly: PropTypes.bool,
  showJson: PropTypes.bool.isRequired
};

export default PageModelEditor;
