import React, { Fragment } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import {
  ContentPanel,
  SubHeader,
  FormikFieldText,
  FormikFieldNumber,
  FormikFieldPassword,
  FormikComboBox,
  FormikSwitch
} from '../../../../components';
import { DestinationsService } from '../../../../services';
import {
  isInvalid,
  hasError,
  validateName,
  validateEmptyField,
  validateEmailAddr
} from '../../../../utils/validate';
import {
  destinationText,
  hostText,
  portText,
  mimeLayoutText,
  sessionTimeoutText,
  tlsText,
  starttlsText,
  trustAllText,
  trustedHostText,
  simulateText,
  debugText,
  proxyText
} from '../../../../utils/i18n/destination';
import {
  fromText,
  toText,
  ccText,
  bccText
} from '../../../../utils/i18n/watch';
import {
  nameText,
  userText,
  passwordText,
  securityText,
  defaultsText
} from '../../../../utils/i18n/common';

const Debug = () => (
  <Fragment>
    <SubHeader
      title={<h4>{debugText}</h4>}
    />
    <EuiFlexGroup className="sg-flex-group">
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="debug"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true
          }}
          elementProps={{
            label: debugText,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
            }
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="simulate"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true
          }}
          elementProps={{
            label: simulateText,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
            }
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

const Security = ({
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  <Fragment>
    <SubHeader
      title={<h4>{securityText}</h4>}
    />
    <EuiSpacer size="s" />
    <EuiFlexGroup className="sg-flex-group">
      <EuiFlexItem>
        <FormikFieldText
          name="user"
          formRow
          rowProps={{
            label: userText,
          }}
        />
        <FormikFieldPassword
          name="password"
          formRow
          rowProps={{
            label: passwordText,
          }}
        />
        <FormikComboBox
          name="trusted_hosts"
          formRow
          rowProps={{
            label: trustedHostText,
          }}
          elementProps={{
            options: [],
            isClearable: true,
            onBlur: onComboBoxOnBlur,
            onChange: onComboBoxChange(),
            onCreateOption: onComboBoxCreateOption()
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="enable_tls"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
          }}
          elementProps={{
            label: tlsText,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
            }
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="enable_start_tls"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
          }}
          elementProps={{
            label: starttlsText,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
            }
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="trust_all"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
          }}
          elementProps={{
            label: trustAllText,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
            }
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

const Defaults = ({
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  <Fragment>
    <SubHeader
      title={<h4>{defaultsText}</h4>}
    />
    <EuiSpacer size="s" />
    <div className="group">
      <FormikFieldText
        name="default_from"
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
          validate: validateEmailAddr(false)
        }}
      />
      <FormikComboBox
        name="default_to"
        formRow
        rowProps={{
          label: toText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false)
        }}
      />
      <FormikComboBox
        name="default_cc"
        formRow
        rowProps={{
          label: ccText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false)
        }}
      />
      <FormikComboBox
        name="default_bcc"
        formRow
        rowProps={{
          label: bccText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isClearable: true,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false)
        }}
      />
    </div>
  </Fragment>
);

Defaults.propTypes = {
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

const Proxy = () => (
  <Fragment>
    <SubHeader
      title={<h4>{proxyText}</h4>}
    />
    <EuiSpacer size="s" />
    <div className="group">
      <FormikFieldText
        name="proxy_host"
        formRow
        rowProps={{
          label: hostText,
        }}
      />
      <FormikFieldNumber
        name="proxy_port"
        formRow
        rowProps={{
          label: portText,
        }}
      />
      <FormikFieldText
        name="proxy_user"
        formRow
        rowProps={{
          label: userText,
        }}
      />
      <FormikFieldPassword
        name="proxy_password"
        formRow
        rowProps={{
          label: passwordText,
        }}
      />
    </div>
  </Fragment>
);

const EmailDestination = ({
  httpClient,
  id,
  formik: { values },
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => {
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={(<p>{destinationText} {values.type}</p>)}
      titleSize="s"
    >
      <div className="sg-group">
        <FormikFieldText
          name="_id"
          formRow
          rowProps={{
            label: nameText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            isInvalid,
          }}
          formikFieldProps={{
            validate: validateName(new DestinationsService(httpClient), isUpdatingName)
          }}
        />
        <FormikFieldText
          name="host"
          formRow
          rowProps={{
            label: hostText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            isInvalid,
          }}
          formikFieldProps={{
            validate: validateEmptyField
          }}
        />
        <FormikFieldNumber
          name="port"
          formRow
          rowProps={{
            label: portText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            isInvalid,
          }}
          formikFieldProps={{
            validate: validateEmptyField
          }}
        />
        <FormikFieldText
          name="mime_layout"
          formRow
          rowProps={{
            label: mimeLayoutText,
          }}
        />
        <FormikFieldNumber
          name="session_timeout"
          formRow
          rowProps={{
            label: sessionTimeoutText,
          }}
        />
      </div>
      <EuiSpacer />
      <Security
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxChange={onComboBoxChange}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />
      <EuiSpacer />
      <Proxy />
      <EuiSpacer />
      <Defaults
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxChange={onComboBoxChange}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />
      <EuiSpacer />
      <Debug />
    </ContentPanel>
  );
};

EmailDestination.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
  httpClient: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default connectFormik(EmailDestination);