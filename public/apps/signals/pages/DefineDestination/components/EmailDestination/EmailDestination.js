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
  validateEmptyField
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

const STYLE = { paddingLeft: '10px' };

const Security = () => (
  <Fragment>
    <SubHeader
      title={<h4>{securityText}</h4>}
    />
    <EuiSpacer size="s" />
    <EuiFlexGroup style={{ maxWidth: '1200px' }}>
      <EuiFlexItem>
        <FormikFieldText
          name="user"
          formRow
          rowProps={{
            label: userText,
            style: STYLE,
          }}
        />
        <FormikFieldPassword
          name="password"
          formRow
          rowProps={{
            label: passwordText,
            style: STYLE,
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="enable_tls"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
            style: { paddingLeft: '0px' }
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
            style: { paddingLeft: '0px' }
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
            style: { paddingLeft: '0px' }
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
    <EuiSpacer size="s" />
    <SubHeader
      title={<h4>{defaultsText}</h4>}
    />
    <EuiSpacer size="s" />
    <FormikFieldText
      name="default_from"
      formRow
      rowProps={{
        label: fromText,
        style: STYLE,
      }}
    />
    <FormikComboBox
      name="default_to"
      formRow
      rowProps={{
        label: toText,
        style: STYLE,
      }}
      elementProps={{
        options: [],
        isClearable: true,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption()
      }}
    />
    <FormikComboBox
      name="default_cc"
      formRow
      rowProps={{
        label: ccText,
        style: STYLE,
      }}
      elementProps={{
        options: [],
        isClearable: true,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption()
      }}
    />
    <FormikComboBox
      name="default_bcc"
      formRow
      rowProps={{
        label: bccText,
        style: STYLE,
      }}
      elementProps={{
        options: [],
        isClearable: true,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption()
      }}
    />
  </Fragment>
);

Defaults.propTypes = {
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

const Proxy = () => (
  <Fragment>
    <EuiSpacer size="s" />
    <SubHeader
      title={<h4>{proxyText}</h4>}
    />
    <EuiSpacer size="s" />
    <FormikFieldText
      name="proxy_host"
      formRow
      rowProps={{
        label: hostText,
        style: STYLE,
      }}
    />
    <FormikFieldNumber
      name="proxy_port"
      formRow
      rowProps={{
        label: portText,
        style: STYLE,
      }}
    />
    <FormikFieldText
      name="proxy_user"
      formRow
      rowProps={{
        label: userText,
        style: STYLE,
      }}
    />
    <FormikFieldPassword
      name="proxy_password"
      formRow
      rowProps={{
        label: passwordText,
        style: STYLE,
      }}
    />
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
      bodyStyles={{ padding: 'initial', ...STYLE }}
    >
      <FormikFieldText
        name="_id"
        formRow
        rowProps={{
          label: nameText,
          style: STYLE,
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
          style: STYLE,
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
          style: STYLE,
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
          style: STYLE,
        }}
      />
      <FormikFieldNumber
        name="session_timeout"
        formRow
        rowProps={{
          label: sessionTimeoutText,
          style: STYLE,
        }}
      />
      <Security />
      <Proxy />
      <Defaults
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxChange={onComboBoxChange}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />
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
