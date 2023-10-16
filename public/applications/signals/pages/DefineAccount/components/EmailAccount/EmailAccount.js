/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment, useContext } from 'react';
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
  FormikSwitch,
  FormikErrorsCallOut,
} from '../../../../components';
import { AccountsService } from '../../../../services';
import {
  isInvalid,
  hasError,
  validateName,
  validateEmptyField,
  validateEmailAddr,
  validateEmailAddrWithName,
} from '../../../../utils/validate';
import {
  accountText,
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
  proxyText,
} from '../../../../utils/i18n/account';
import { fromText, toText, ccText, bccText } from '../../../../utils/i18n/watch';
import {
  nameText,
  userText,
  passwordText,
  securityText,
  defaultsText,
} from '../../../../utils/i18n/common';
import { ACCOUNT_TYPE } from '../../../Accounts/utils/constants';

import { Context } from '../../../../Context';

const Debug = ({ onSwitchChange }) => (
  <Fragment>
    <SubHeader title={<h4>{debugText}</h4>} />
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="debug"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
            style: { marginTop: '0px' },
          }}
          elementProps={{
            label: debugText,
            onChange: onSwitchChange,
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <FormikSwitch
          name="simulate"
          formRow
          rowProps={{
            hasEmptyLabelSpace: true,
            style: { marginTop: '0px' },
          }}
          elementProps={{
            label: simulateText,
            onChange: onSwitchChange,
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

const Security = ({
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption,
  onSwitchChange,
}) => (
  <Fragment>
    <SubHeader title={<h4>{securityText}</h4>} />
    <EuiSpacer size="s" />
    <EuiFlexGroup>
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
            onCreateOption: onComboBoxCreateOption(),
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
            onChange: onSwitchChange,
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
            onChange: onSwitchChange,
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
            onChange: onSwitchChange,
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </Fragment>
);

const Defaults = ({ onComboBoxChange, onComboBoxOnBlur, onComboBoxCreateOption }) => (
  <Fragment>
    <SubHeader title={<h4>{defaultsText}</h4>} />
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
          validate: validateEmailAddr(false),
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
          onCreateOption: onComboBoxCreateOption(),
        }}
        formikFieldProps={{
          validate: validateEmailAddrWithName(false),
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
          onCreateOption: onComboBoxCreateOption(),
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false),
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
          onCreateOption: onComboBoxCreateOption(),
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false),
        }}
      />
    </div>
  </Fragment>
);

Defaults.propTypes = {
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
};

const Proxy = () => (
  <Fragment>
    <SubHeader title={<h4>{proxyText}</h4>} />
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

const EmailAccount = ({ id, formik: { values, errors } }) => {
  const {
    httpClient,
    onSwitchChange,
    onComboBoxChange,
    onComboBoxOnBlur,
    onComboBoxCreateOption,
  } = useContext(Context);
  const isUpdatingName = id !== values._id;

  return (
    <ContentPanel
      title={
        <p>
          {accountText} {values.type}
        </p>
      }
      titleSize="s"
    >
      <FormikErrorsCallOut errors={errors} />
      <EuiSpacer />

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
          validate: validateName(
            new AccountsService(httpClient, ACCOUNT_TYPE.EMAIL),
            isUpdatingName
          ),
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
          validate: validateEmptyField,
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
          validate: validateEmptyField,
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

      <EuiSpacer />
      <Security
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxChange={onComboBoxChange}
        onComboBoxCreateOption={onComboBoxCreateOption}
        onSwitchChange={onSwitchChange}
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
      <Debug onSwitchChange={onSwitchChange} />
    </ContentPanel>
  );
};

EmailAccount.propTypes = {
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
};

export default connectFormik(EmailAccount);
