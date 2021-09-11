/* eslint-disable @osd/eslint/require-license-header */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get, cloneDeep } from 'lodash';
import { EuiButton } from '@elastic/eui';
import { useCheckTemplates, useWatchChecks } from '../../../hooks';
import JsonWatch from '../../JsonWatch';
import { ContentPanel } from '../../../../../components';
import { BlocksWatch } from '../../BlocksWatch';
import { FLYOUTS } from '../../../../../utils/constants';
import { WATCH_TYPES } from '../../../utils/constants';
import { addText, pleaseFillOutAllRequiredFieldsText } from '../../../../../utils/i18n/common';

import { Context } from '../../../../../Context';

const ActionChecks = ({
  actionIndex,
  isResolveActions,
  formik: { values, setFieldValue, validateForm, submitForm },
}) => {
  const { triggerFlyout, addErrorToast } = useContext(Context);
  const watchType = get(values, '_ui.watchType');
  const checksPath =
    watchType === WATCH_TYPES.BLOCKS
      ? `actions[${actionIndex}].checksBlocks`
      : isResolveActions
      ? `resolve_actions[${actionIndex}].checks`
      : `actions[${actionIndex}].checks`;

  const { addTemplate } = useCheckTemplates({
    setFieldValue,
    checksPath,
  });

  const { isResultVisible, closeResult, executeWatch, editorResult } = useWatchChecks({
    setFieldValue,
  });

  const [templateCounter, setTemplateCounter] = useState(0);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (template) {
      addTemplate({ template, values });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCounter]);

  const addTemplateHelper = (template) => {
    setTemplate(template);
    setTemplateCounter((prevState) => prevState + 1);
  };

  const handleAddTemplate = () => {
    triggerFlyout({
      type: FLYOUTS.CHECK_EXAMPLES,
      payload: { onChange: addTemplateHelper },
    });
  };

  const handleWatchExecute = async () => {
    try {
      const { actions = [] } = await validateForm();
      const isAnyFormError = !!Object.keys(actions).length;

      if (isAnyFormError) {
        await submitForm();
        addErrorToast(pleaseFillOutAllRequiredFieldsText);
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
    // For now hide the checks execution for the action checks. Because it confuses.
    // The SG Elasticsearch plugin API is not ready to send the proper response yet.
    // TODO. Uncomment the code below when the API is ready.
    // <EuiButton
    //   isLoading={isLoading}
    //   isDisabled={isLoading}
    //   data-test-subj="sgAddButton-ExecuteActionChecks"
    //   onClick={handleWatchExecute}
    // >
    //   {executeText}
    // </EuiButton>,
  ];

  if (watchType === WATCH_TYPES.BLOCKS) {
    return (
      <ContentPanel actions={actions} isPanel={false}>
        <BlocksWatch
          checksBlocksPath={checksPath}
          isResultVisible={isResultVisible}
          editorResult={editorResult}
          onCloseResult={closeResult}
          onOpenChecksTemplatesFlyout={handleAddTemplate}
        />
      </ContentPanel>
    );
  } else if (watchType === WATCH_TYPES.GRAPH) {
    return (
      <ContentPanel actions={actions} isPanel={false}>
        <JsonWatch
          checksPath={checksPath}
          isResultVisible={isResultVisible}
          editorResult={editorResult}
          onCloseResult={closeResult}
        />
      </ContentPanel>
    );
  } else {
    return null;
  }
};

ActionChecks.propTypes = {
  actionIndex: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
};

export default connectFormik(ActionChecks);
