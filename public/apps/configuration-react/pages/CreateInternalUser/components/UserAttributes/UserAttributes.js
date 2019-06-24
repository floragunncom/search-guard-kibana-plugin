import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { FormikFieldText, DynamicValuesForm } from '../../../../components';
import { hasError, isInvalid, validateTextField } from '../../../../utils/validation';
import { userAttributesText } from '../../../../utils/i18n/internal_users';

const renderValueField = fieldName => (
  <FormikFieldText
    formRow
    formikFieldProps={{
      validate: validateTextField
    }}
    rowProps={{
      isInvalid,
      error: hasError
    }}
    elementProps={{
      isInvalid
    }}
    name={fieldName}
  />
);

const renderKeyField = fieldName => (
  <FormikFieldText
    formRow
    formikFieldProps={{
      validate: validateTextField
    }}
    rowProps={{
      isInvalid,
      error: hasError
    }}
    elementProps={{
      isInvalid
    }}
    name={fieldName}
  />
);

const UserAttributes = ({ attributes, onTriggerConfirmDeletionModal }) => (
  <FieldArray
    name="_attributes"
    validateOnChange={false}
    render={arrayHelpers => (
      <DynamicValuesForm
        isKey
        title={userAttributesText}
        onAdd={() => arrayHelpers.push({ key: '', value: '' })}
        onRemove={i => {
          onTriggerConfirmDeletionModal({
            onConfirm: () => {
              arrayHelpers.remove(i);
              onTriggerConfirmDeletionModal(null);
            }
          });
        }}
        items={attributes}
        name="_attributes"
        onRenderValueField={renderValueField}
        onRenderKeyField={renderKeyField}
      />
    )}
  />
);

UserAttributes.propTypes = {
  attributes: PropTypes.array.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default UserAttributes;
