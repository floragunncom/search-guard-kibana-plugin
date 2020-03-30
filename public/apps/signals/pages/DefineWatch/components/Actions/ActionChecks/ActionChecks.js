/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get, cloneDeep } from 'lodash';
import { EuiButton } from '@elastic/eui';
import JsonWatch from '../../JsonWatch';
import { useCheckTemplates, useJsonWatchChecks } from '../../../hooks';
import { FLYOUTS } from '../../../../../utils/constants';
import { addText, pleaseFillOutAllRequiredFieldsText } from '../../../../../utils/i18n/common';
import { executeText, checksText } from '../../../../../utils/i18n/watch';
import { ControlledContent } from '../../../../../components';

import { Context } from '../../../../../Context';

const ActionChecks = ({
  actionIndex,
  formik: { values, setFieldValue, validateForm, submitForm },
}) => {
  const { httpClient, triggerFlyout, addErrorToast } = useContext(Context);

  const checksPath = `actions[${actionIndex}].checks`;

  const { addTemplate } = useCheckTemplates({
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
    httpClient,
    setFieldValue,
  });

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
          payload: { onChange: template => addTemplate({ template, values }) },
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
};

export default connectFormik(ActionChecks);
