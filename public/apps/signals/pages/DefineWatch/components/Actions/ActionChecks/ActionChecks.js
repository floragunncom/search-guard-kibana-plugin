/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get, cloneDeep } from 'lodash';
import { EuiButton } from '@elastic/eui';
import JsonWatch from '../../JsonWatch';
import { useCheckTemplates, useWatchChecks } from '../../../hooks';
import { ContentPanel } from '../../../../../components';
import { BlocksWatch } from '../../BlocksWatch';
import { FLYOUTS } from '../../../../../utils/constants';
import { WATCH_TYPES } from '../../../utils/constants';
import { addText, pleaseFillOutAllRequiredFieldsText } from '../../../../../utils/i18n/common';
import { executeText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

const ActionChecks = ({
  actionIndex,
  formik: { values, setFieldValue, validateForm, submitForm },
}) => {
  const { triggerFlyout, addErrorToast } = useContext(Context);
  const watchType = get(values, '_ui.watchType');
  const checksPath =
    watchType === WATCH_TYPES.BLOCKS
      ? `actions[${actionIndex}].checksBlocks`
      : `actions[${actionIndex}].checks`;
  const checksBlocksAccordionId = `sgBlocksWatch-ActionChecks--action_${actionIndex}`;

  const { addTemplate } = useCheckTemplates({
    setFieldValue,
    checksPath,
  });

  const { isResultVisible, closeResult, executeWatch, editorResult, isLoading } = useWatchChecks({
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
    <EuiButton
      isLoading={isLoading}
      isDisabled={isLoading}
      data-test-subj="sgAddButton-ExecuteActionChecks"
      onClick={handleWatchExecute}
    >
      {executeText}
    </EuiButton>,
  ];

  // The graph watch doesn't have checks in actions.
  return (
    <ContentPanel actions={actions} isPanel={false}>
      {watchType === WATCH_TYPES.BLOCKS ? (
        <BlocksWatch
          accordionId={checksBlocksAccordionId}
          checksBlocksPath={checksPath}
          isResultVisible={isResultVisible}
          editorResult={editorResult}
          onCloseResult={closeResult}
          onOpenChecksTemplatesFlyout={handleAddTemplate}
        />
      ) : (
        <JsonWatch
          checksPath={checksPath}
          isResultVisible={isResultVisible}
          editorResult={editorResult}
          onCloseResult={closeResult}
        />
      )}
    </ContentPanel>
  );
};

ActionChecks.propTypes = {
  actionIndex: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
};

export default connectFormik(ActionChecks);
