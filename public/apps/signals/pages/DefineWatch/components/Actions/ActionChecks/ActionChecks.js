/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import { get, cloneDeep } from 'lodash';
import { EuiButton, EuiFormRow, EuiText, EuiLink, EuiCodeEditor, EuiSpacer } from '@elastic/eui';
import JsonWatch from '../../JsonWatch';
import BlocksWatch from '../../BlocksWatch';
import QueryStat from '../../QueryStat';
import { useCheckTemplates, useJsonWatchChecks } from '../../../hooks';
import { addErrorToast } from '../../../../../redux/actions';
import { FLYOUTS } from '../../../../../utils/constants';
import { WATCH_TYPES } from '../../../utils/constants';
import { addText, pleaseFillOutAllRequiredFieldsText } from '../../../../../utils/i18n/common';
import { executeText, responseText, closeText } from '../../../../../utils/i18n/watch';
import { ContentPanel } from '../../../../../components';

import { Context } from '../../../../../Context';

const ActionChecks = ({
  actionIndex,
  formik: { values, setFieldValue, validateForm, submitForm },
  dispatch,
}) => {
  const { httpClient, triggerFlyout, editorTheme, editorOptions } = useContext(Context);

  const watchType = get(values, '_ui.watchType');
  const checksPath = `actions[${actionIndex}].checks`;
  const checksBlocksPath = `actions[${actionIndex}].checksBlocks`;

  const [templateCounter, setTemplateCounter] = useState(0);
  const [template, setTemplate] = useState(null);

  const { addTemplate } = useCheckTemplates({
    dispatch,
    setFieldValue,
    checksPath,
    checksBlocksPath,
  });

  const {
    isResultVisible,
    closeResult,
    executeWatch,
    editorResult,
    isLoading,
  } = useJsonWatchChecks({
    dispatch,
    httpClient,
    setFieldValue,
  });

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

  const handleWatchExecute = async () => {
    try {
      const { actions = [] } = await validateForm();
      const isAnyFormError = !!Object.keys(actions).length;

      if (isAnyFormError) {
        await submitForm();
        dispatch(addErrorToast(pleaseFillOutAllRequiredFieldsText));
        return;
      }
    } catch (error) {
      console.error('ActionChecks -- handleWatchExecute', error);
      return;
    }

    const newValues = cloneDeep(values);
    const actionToExecute = get(newValues, `actions[${actionIndex}]`);

    executeWatch({
      values: { ...newValues, actions: [actionToExecute] },
      simulate: true,
      skipActions: false,
    });
  };

  const actions = [
    <EuiButton data-test-subj="sgAddButton-AddActionChecks" onClick={handleAddTemplate}>
      {addText}
    </EuiButton>,
    <EuiButton
      isLoading={isLoading}
      isDisabled={isLoading}
      data-test-subj="sgAddButton-ExecuteActionChecks"
      onClick={handleWatchExecute}
    >
      {executeText}
    </EuiButton>,
  ];

  let checksDefinition;
  switch (watchType) {
    case WATCH_TYPES.BLOCKS:
      // TODO: add <QueryStat />
      checksDefinition = (
        <>
          {isResultVisible && (
            <>
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
              <EuiSpacer />
            </>
          )}

          <BlocksWatch
            onAddTemplate={handleAddTemplate}
            onCloseResult={closeResult}
            checksBlocksPath={checksBlocksPath}
            droppableId={`sgBlocks-ActionChecks-droppable-action-${actionIndex}`}
            draggableId={`sgBlocks-ActionChecks-draggable-action-${actionIndex}`}
          />
        </>
      );
      break;
    default:
      // JSON watch
      // TODO: add <QueryStat />
      checksDefinition = (
        <>
          <JsonWatch
            checksPath={checksPath}
            isResultVisible={isResultVisible}
            editorResult={editorResult}
            onCloseResult={closeResult}
          />
        </>
      );
  }

  useEffect(() => {
    if (template) {
      addTemplate({ template, values });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCounter]);

  return (
    <ContentPanel actions={actions} isPanel={false}>
      <div>{checksDefinition}</div>
    </ContentPanel>
  );
};

ActionChecks.propTypes = {
  actionIndex: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connectRedux()(connectFormik(ActionChecks));
