import React, { Fragment, useContext } from 'react';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { EuiSpacer } from '@elastic/eui';
import { FormikFieldText, FormikComboBox } from '../../../../../components';
import ActionChecks from '../ActionChecks';
import { nameText } from '../../../../../utils/i18n/common';
import { severityText, resolvesSeverityText } from '../../../../../utils/i18n/watch';
import WatchIndex from '../../WatchIndex';
import { validateEmptyField, isInvalid, hasError } from '../../../utils/validate';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import { SEVERITY_OPTIONS } from '../../../utils/constants';

import { Context } from '../../../../../Context';

const ElasticsearchAction = ({ isResolveActions, formik: { values }, index }) => {
  const { httpClient, onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption } = useContext(
    Context
  );

  const isSeverity = get(values, '_ui.isSeverity', false);

  const severityLabel = isResolveActions ? resolvesSeverityText : severityText;
  const severityPath = isResolveActions
    ? `resolve_actions[${index}].resolves_severity`
    : `actions[${index}].severity`;

  const actionsRootPath = isResolveActions ? 'resolve_actions' : 'actions';
  const namePath = `${actionsRootPath}[${index}].name`;
  const indexPath = `${actionsRootPath}[${index}].index`;

  return (
    <Fragment>
      <FormikFieldText
        name={namePath}
        formRow
        rowProps={{
          label: nameText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isInvalid,
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
        formikFieldProps={{
          validate: validateEmptyField,
        }}
      />
      {isSeverity && (
        <FormikComboBox
          name={severityPath}
          formRow
          rowProps={{
            label: severityLabel,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            options: SEVERITY_OPTIONS,
            isClearable: true,
            placeholder: 'Select severity',
            onBlur: onComboBoxOnBlur,
            onChange: onComboBoxChange(),
            onCreateOption: onComboBoxCreateOption()
          }}
        />
      )}
      <ActionThrottlePeriod index={index} />
      <WatchIndex
        isClearable={false}
        httpClient={httpClient}
        indexFieldName={indexPath}
        singleSelection={{ asPlainText: true }}
        onComboBoxChange={onComboBoxChange}
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />

      <EuiSpacer />
      <ActionChecks actionIndex={index} />
    </Fragment>
  );
};

ElasticsearchAction.defaultProps = {
  isResolveActions: false,
};

ElasticsearchAction.propTypes = {
  isResolveActions: PropTypes.bool,
  formik: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export default connectFormik(ElasticsearchAction);
