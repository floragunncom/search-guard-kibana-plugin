import React, { useContext, useState, useEffect } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiButton, EuiSpacer, EuiFormRow, EuiText, EuiLink, EuiCodeEditor } from '@elastic/eui';
import { useCheckTemplates, useJsonWatchChecks } from '../../hooks';
import { FormikSelect, ContentPanel } from '../../../../components';
import JsonWatch from '../JsonWatch';
import BlocksWatch from '../BlocksWatch';
import GraphWatch from '../GraphWatch';
import QueryStat from '../QueryStat';
import SeverityForm from '../SeverityForm';
import { FLYOUTS } from '../../../../utils/constants';
import { WATCH_TYPES_OPTIONS, WATCH_TYPES } from '../../utils/constants';
import { responseText, closeText } from '../../../../utils/i18n/watch';
import { definitionText, typeText, executeText, addText } from '../../../../utils/i18n/common';

import { Context } from '../../../../Context';

const DefinitionPanel = ({ formik: { values, setFieldValue } }) => {
  const {
    editorTheme,
    editorOptions,
    httpClient,
    triggerFlyout,
    onComboBoxChange,
    onComboBoxCreateOption,
    onComboBoxOnBlur,
  } = useContext(Context);

  const { addTemplate } = useCheckTemplates({ setFieldValue });

  const {
    isResultVisible,
    closeResult,
    editorResult,
    isLoading,
    executeWatch,
  } = useJsonWatchChecks({ setFieldValue });

  const [templateCounter, setTemplateCounter] = useState(0);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (template) {
      addTemplate({ template, values });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCounter]);

  const addTemplateHelper = template => {
    setTemplate(template);
    setTemplateCounter(prevState => prevState + 1);
  };

  const handleAddTemplate = () => {
    triggerFlyout({
      type: FLYOUTS.CHECK_EXAMPLES,
      // We use addTemplateHelper here to avoid closure.
      // We don't get new "values" in the onChange callback function
      // without this helper.
      payload: { onChange: addTemplateHelper },
    });
  };

  const watchType = get(values, '_ui.watchType', WATCH_TYPES.GRAPH);
  const isSeverity = get(values, '_ui.isSeverity', false);
  let contentPanleActions = [];
  let watch;

  const addChecksBtn = (
    <EuiButton data-test-subj="sgAddButton-AddChecks" onClick={handleAddTemplate}>
      {addText}
    </EuiButton>
  );

  const execChecksBtn = (
    <EuiButton
      isLoading={isLoading}
      isDisabled={isLoading}
      data-test-subj="sgAddButton-ExecuteChecks"
      onClick={() => executeWatch({ values })}
    >
      {executeText}
    </EuiButton>
  );

  switch (watchType) {
    case WATCH_TYPES.JSON:
      contentPanleActions = [addChecksBtn, execChecksBtn];

      watch = (
        <>
          <EuiSpacer />
          <JsonWatch
            isResultVisible={isResultVisible}
            editorResult={editorResult}
            onCloseResult={closeResult}
          />
          <QueryStat />
          {isSeverity && <SeverityForm isTitle />}
        </>
      );
      break;
    case WATCH_TYPES.BLOCKS:
      contentPanleActions = [addChecksBtn, execChecksBtn];

      watch = (
        <>
          {isResultVisible && (
            <>
              <EuiSpacer />
              <EuiFormRow
                fullWidth
                label={responseText}
                labelAppend={
                  <EuiText size="xs" onClick={closeResult}>
                    <EuiLink id="close-response" data-test-subj="sgBlocks-closeAllChecksResponse">
                      {closeText} X
                    </EuiLink>
                  </EuiText>
                }
              >
                <EuiCodeEditor
                  theme={editorTheme}
                  setOptions={editorOptions}
                  mode="json"
                  width="100%"
                  height="500px"
                  value={editorResult}
                  readOnly
                />
              </EuiFormRow>
              <QueryStat />
            </>
          )}

          <EuiSpacer />
          <BlocksWatch />

          <EuiSpacer />
          {isSeverity && <SeverityForm isTitle />}
        </>
      );
      break;
    default:
      watch = (
        <>
          <GraphWatch
            isResultVisible={isResultVisible}
            httpClient={httpClient}
            onComboBoxChange={onComboBoxChange}
            onComboBoxOnBlur={onComboBoxOnBlur}
            onComboBoxCreateOption={onComboBoxCreateOption}
          />
          <QueryStat />
        </>
      );
      break;
  }

  return (
    <ContentPanel title={definitionText} titleSize="s" actions={contentPanleActions}>
      <div>
        <FormikSelect
          name="_ui.watchType"
          formRow
          rowProps={{
            label: typeText,
          }}
          elementProps={{
            options: WATCH_TYPES_OPTIONS,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
              form.setFieldValue('_ui.checksResult', null);
            },
          }}
        />

        {watch}
      </div>
    </ContentPanel>
  );
};

DefinitionPanel.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default connectFormik(DefinitionPanel);
