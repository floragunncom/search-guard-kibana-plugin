/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import { get, cloneDeep } from 'lodash';
import { EuiButton } from '@elastic/eui';
import JsonWatch from '../../JsonWatch';
import { useCheckTemplates, useJsonWatchChecks } from '../../../hooks';
import { addErrorToast } from '../../../../../redux/actions';
import { FLYOUTS } from '../../../../../utils/constants';
import { addText, pleaseFillOutAllRequiredFieldsText } from '../../../../../utils/i18n/common';
import { executeText, checksText } from '../../../../../utils/i18n/watch';
import { ControlledContent } from '../../../../../components';

import { Context } from '../../../../../Context';

const ActionChecks = ({
  actionIndex,
  formik: { values, setFieldValue, validateForm, submitForm },
  dispatch,
}) => {
  const checksPath = `actions[${actionIndex}].checks`;
  const { httpClient, triggerFlyout } = useContext(Context);

  const [templateCounter, setTemplateCounter] = useState(0);
  const [template, setTemplate] = useState(null);

  const { addTemplate } = useCheckTemplates({
    dispatch,
    setFieldValue,
    checksPath,
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

  useEffect(() => {
    if (template) {
      addTemplate({ template, values });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCounter]);

  return (
    <ControlledContent title={checksText} titleProps={{ size: 'xs' }} actions={actions}>
      <JsonWatch
        checksPath={checksPath}
        isResultVisible={isResultVisible}
        editorResult={editorResult}
        onCloseResult={closeResult}
      />
    </ControlledContent>
  );
};

ActionChecks.propTypes = {
  actionIndex: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connectRedux()(connectFormik(ActionChecks));
