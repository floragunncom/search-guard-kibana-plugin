import React, { Fragment } from 'react';
import { EuiHorizontalRule } from '@elastic/eui';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { FormikFieldText, DynamicValuesForm, TitleSecondary } from '../../../../components';
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
  <Fragment>
    <TitleSecondary text={userAttributesText} />
    <EuiHorizontalRule />
    <FieldArray
      name="_attributes"
      validateOnChange={false}
      render={arrayHelpers => (
        <DynamicValuesForm
          isKey
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
  </Fragment>
);

UserAttributes.propTypes = {
  attributes: PropTypes.array.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default UserAttributes;
