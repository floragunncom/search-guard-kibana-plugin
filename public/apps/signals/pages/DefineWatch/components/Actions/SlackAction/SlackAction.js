import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
} from '../../../../../components';
import {
  fromText,
  iconEmojiText
} from '../../../../../utils/i18n/watch';
import {
  nameText,
  bodyText,
} from '../../../../../utils/i18n/common';
import {
  validateEmptyField,
  isInvalid,
  hasError
} from '../../../../../utils/validate';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionDestination from '../ActionDestination';
import { DESTINATION_TYPE } from '../../../../Destinations/utils/constants';
import { CODE_EDITOR } from '../../../../../../utils/constants';

const { theme, ...setOptions } = CODE_EDITOR;

const SlackAction = ({
  index,
  destinations,
  formik: { values: { actions } }
}) => (
  <Fragment>
    <FormikFieldText
      name={`actions[${index}].name`}
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
        validate: validateEmptyField
      }}
    />
    <ActionThrottlePeriod index={index} />
    <ActionDestination
      index={index}
      destinations={destinations}
      destinationType={DESTINATION_TYPE.SLACK}
    />
    <FormikFieldText
      name={`actions[${index}].from`}
      formRow
      rowProps={{
        label: fromText,
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
        validate: validateEmptyField
      }}
    />
    <FormikFieldText
      name={`actions[${index}].icon_emoji`}
      formRow
      rowProps={{
        label: iconEmojiText,
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
        validate: validateEmptyField
      }}
    />
    <EuiSpacer />
    <FormikCodeEditor
      name={`actions[${index}].text`}
      formRow
      rowProps={{
        label: bodyText,
        fullWidth: true,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        setOptions: {
          ...setOptions,
          maxLines: 10,
          minLines: 10
        },
        mode: 'text',
        width: '100%',
        theme,
        onChange: (e, text, field, form) => {
          form.setFieldValue(field.name, text);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateEmptyField
      }}
    />
    <ActionBodyPreview index={index} template={actions[index].text} />
  </Fragment>
);

SlackAction.defaultProps = {
  destinations: []
};

SlackAction.propTypes = {
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  destinations: PropTypes.array
};

export default connectFormik(SlackAction);
