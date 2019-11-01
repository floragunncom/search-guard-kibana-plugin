import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import queryString from 'query-string';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer
} from '@elastic/eui';
import {
  EmailAccount,
  SlackAccount
} from './components';
import {
  CancelButton,
  SaveButton
} from '../../components';
import { AccountsService } from '../../services';
import { addErrorToast, addSuccessToast } from '../../redux/actions';
import { updateText, createText, saveText } from '../../utils/i18n/common';
import { updateAccountText, createAccountText } from '../../utils/i18n/account';
import { accountToFormik, formikToAccount } from './utils';
import { APP_PATH } from '../../utils/constants';
import { ACCOUNT_TYPE } from '../Accounts/utils/constants';
import * as DEFAULTS from './utils/defaults';

class DefineAccount extends Component {
  constructor(props) {
    super(props);

    const { location, httpClient } = this.props;
    const { accountType } = queryString.parse(location.search);

    this.destService = new AccountsService(httpClient, accountType);
    const initialValues = accountType
      ? DEFAULTS[accountType] : DEFAULTS[ACCOUNT_TYPE.EMAIL];

    this.state = {
      initialValues: accountToFormik(initialValues)
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { dispatch, location } = this.props;
    const { id } = queryString.parse(location.search);

    try {
      if (id) {
        const { resp: initialValues } = await this.destService.get(id);
        this.setState({ initialValues: accountToFormik(initialValues) });
      }
    } catch (error) {
      console.error('DefineAccount -- fetchData', error);
      dispatch(addErrorToast(error));
      console.debug('DefineAccount -- id', id);
    }
  }

  onCancel = () => {
    const { history } = this.props;

    if (this.state.isEdit) history.goBack();
    history.push(APP_PATH.ACCOUNTS);
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { dispatch } = this.props;
    const { _id: id, ...account } = values;

    try {
      await this.destService.put(formikToAccount(account), id);
      setSubmitting(false);
      dispatch(addSuccessToast((<p>{saveText} {id}</p>)));
      this.onCancel();
    } catch (error) {
      console.error('DefineAccount -- onSubmit', error);
      setSubmitting(false);
      dispatch(addErrorToast(error));
      console.debug('DefineAccount -- formik values', values);
    }
  }

  render() {
    const {
      location,
      httpClient,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption
    } = this.props;

    const { initialValues } = this.state;
    const { id, accountType } = queryString.parse(location.search);
    const isEdit = !!id;

    let account = (
      <EmailAccount
        httpClient={httpClient}
        id={id}
        onComboBoxChange={onComboBoxChange}
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />
    );

    if (accountType === ACCOUNT_TYPE.SLACK) {
      account = <SlackAccount httpClient={httpClient} id={id} />;
    }

    return (
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={this.onSubmit}
          validateOnChange={false}
          enableReinitialize
          render={({ handleSubmit, isSubmitting }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{isEdit ? updateAccountText : createAccountText}</h1>
              </EuiTitle>
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
        />
      </div>
    );
  }
}

DefineAccount.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default connectRedux()(DefineAccount);
