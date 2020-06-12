/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get, cloneDeep } from 'lodash';
import { EuiButton } from '@elastic/eui';
import JsonWatch from '../../JsonWatch';
import { useCheckTemplates, useJsonWatchChecks } from '../../../hooks';
import { FLYOUTS } from '../../../../../utils/constants';
import { addText, pleaseFillOutAllRequiredFieldsText } from '../../../../../utils/i18n/common';
import { executeText, checksText } from '../../../../../utils/i18n/watch';
import { ContentPanel } from '../../../../../components';

import { Context } from '../../../../../Context';

const ActionChecks = ({
  actionIndex,
  formik: { values, setFieldValue, validateForm, submitForm },
}) => {
  const { triggerFlyout, addErrorToast } = useContext(Context);

  const checksPath = `actions[${actionIndex}].checks`;

  const { addTemplate } = useCheckTemplates({
    setFieldValue,
    checksPath,
    // TODO: deprecate the useBlocks when BlocksWatch work in actions
    useBlocks: false,
  });

  const {
    isResultVisible,
    closeResult,
    executeWatch,
    editorResult,
    isLoading,
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
    <EuiButton
      data-test-subj="sgAddButton-AddActionChecks"
      onClick={() => {
        triggerFlyout({
          type: FLYOUTS.CHECK_EXAMPLES,
          payload: { onChange: addTemplateHelper },
        });
      }}
    >
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
};

ActionChecks.propTypes = {
  actionIndex: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
};

export default connectFormik(ActionChecks);