/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import queryString from 'query-string';
import { EuiBadge, EuiFlexGroup, EuiFlexItem, EuiTitle, EuiSpacer } from '@elastic/eui';
import { EmailAccount, SlackAccount, JiraAccount, PagerdutyAccount } from './components';
import { CancelButton, SaveButton } from '../../components';
import { AccountsService } from '../../services';
import { updateText, createText, saveText } from '../../utils/i18n/common';
import {
  createAccountText,
  createTenantAccountTitleText,
  currentTenantText,
  tenantAccountShadowWarningText,
  updateAccountText,
} from '../../utils/i18n/account';
import { accountToFormik, formikToAccount } from './utils';
import { APP_PATH } from '../../utils/constants';
import { ACCOUNT_TYPE } from '../Accounts/utils/constants';
import * as DEFAULTS from './utils/defaults';

import { Context } from '../../Context';

class DefineAccount extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { location } = this.props;
    const { httpClient } = context;
    const { accountType, scope } = queryString.parse(location.search);

    this.tenantScoped = scope === 'tenant';
    this.destService = new AccountsService(httpClient, accountType, this.tenantScoped);
    this.globalDestService = new AccountsService(httpClient, accountType);
    const initialValues = accountType ? DEFAULTS[accountType] : DEFAULTS[ACCOUNT_TYPE.EMAIL];

    this.state = {
      initialValues: accountToFormik(initialValues),
    };

    console.debug('DefineAccount -- constructor -- values', this.state.initialValues);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    if (!id) return;

    let account;
    let initialValues;
    try {
      const { resp } = await this.destService.get(id);
      account = resp;
      console.debug('DefineAccount -- fetchData -- account', account);

      initialValues = accountToFormik(account);
      this.setState({ initialValues });
    } catch (error) {
      console.error('DefineAccount -- fetchData', error);
      this.context.addErrorToast(error);
    }

    console.debug('DefineAccount -- fetchData -- id', id);
    console.debug('DefineAccount -- fetchData -- values', initialValues);
  };

  onCancel = () => {
    this.props.history.push(this.tenantScoped ? APP_PATH.TENANT_ACCOUNTS : APP_PATH.ACCOUNTS);
  };

  saveAccount = async ({ account, id, setSubmitting }) => {
    try {
      await this.destService.put(account, id);
      setSubmitting(false);
      this.context.addSuccessToast(
        <p>
          {saveText} {id}
        </p>
      );
      this.onCancel();
    } catch (error) {
      console.error('DefineAccount -- onSubmit', error);
      setSubmitting(false);
      this.context.addErrorToast(error);
    }
  };

  onSubmit = async (values, { setSubmitting }) => {
    const { _id: id, ...rest } = values;
    const account = formikToAccount(rest);
    const { location } = this.props;
    const { id: existingId } = queryString.parse(location.search);
    console.debug('DefineAccount -- onSubmit - values', values);
    console.debug('DefineAccount -- onSubmit - account', account);

    if (this.tenantScoped && !existingId) {
      try {
        await this.globalDestService.get(id);
        this.context.triggerConfirmModal({
          title: createTenantAccountTitleText,
          body: <p>{tenantAccountShadowWarningText(id)}</p>,
          onConfirm: () => {
            this.context.triggerConfirmModal(null);
            this.saveAccount({ account, id, setSubmitting });
          },
          onCancel: () => {
            setSubmitting(false);
            this.context.triggerConfirmModal(null);
          },
        });
        return;
      } catch (error) {
        if (!error.body || error.body.statusCode !== 404) {
          setSubmitting(false);
          this.context.addErrorToast(error);
          return;
        }
      }
    }

    await this.saveAccount({ account, id, setSubmitting });
  };

  render() {
    const { location } = this.props;
    const { initialValues } = this.state;
    const { id, accountType } = queryString.parse(location.search);
    const isEdit = !!id;

    let account = <EmailAccount id={id} tenantScoped={this.tenantScoped} />;

    if (accountType === ACCOUNT_TYPE.SLACK) {
      account = <SlackAccount id={id} tenantScoped={this.tenantScoped} />;
    }

    if (accountType === ACCOUNT_TYPE.JIRA) {
      account = <JiraAccount id={id} tenantScoped={this.tenantScoped} />;
    }

    if (accountType === ACCOUNT_TYPE.PAGERDUTY) {
      account = <PagerdutyAccount id={id} tenantScoped={this.tenantScoped} />;
    }

    return (
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={this.onSubmit}
          validateOnChange={false}
          enableReinitialize
        >
          {({ handleSubmit, isSubmitting }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{isEdit ? updateAccountText : createAccountText}</h1>
              </EuiTitle>
              {this.tenantScoped && (
                <>
                  <EuiSpacer size="s" />
                  <EuiBadge color="primary">{currentTenantText}</EuiBadge>
                </>
              )}
              <EuiSpacer />
              {account}
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <CancelButton onClick={this.onCancel} />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <SaveButton
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                    value={isEdit ? updateText : createText}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          )}
        </Formik>
      </div>
    );
  }
}

DefineAccount.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default DefineAccount;
