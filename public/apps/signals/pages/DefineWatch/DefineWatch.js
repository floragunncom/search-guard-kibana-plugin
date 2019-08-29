import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, FieldArray } from 'formik';
import queryString from 'query-string';
import {
  EuiTitle,
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiButtonEmpty,
  EuiButton
} from '@elastic/eui';
import { WatchService } from '../../services';
import { addErrorToast, addSuccessToast } from '../../redux/actions';
import { watchToFormik, formikToWatch } from './utils';
import { DEFAULT_WATCH } from './utils/constants';
import {
  GeneralPanel,
  DefinitionPanel,
  ActionPanel
} from './components';
import {
  CancelButton,
  SaveButton
} from '../../components';
import { APP_PATH } from '../../utils/constants';
import { createWatchText, updateWatchText } from '../../utils/i18n/watch';
import { updateText, createText, saveText } from '../../utils/i18n/common';

class DefineWatch extends Component {
  constructor(props) {
    super(props);

    const { location, httpClient } = this.props;
    this.watchService = new WatchService(httpClient);
    const { id } = queryString.parse(location.search);

    this.state = {
      id,
      isEdit: !!id,
      initialValues: watchToFormik(DEFAULT_WATCH)
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps({ location }) {
    const { id } = queryString.parse(location.search);
    const { id: currentId } = this.state;
    if (id !== currentId) {
      this.setState({ id }, () => {
        this.fetchData();
      });
    }
  }

  fetchData = async () => {
    const { id } = this.state;
    try {
      if (id) {
        const { resp: watch } = await this.watchService.get(id);
        this.setState({ initialValues: watchToFormik(watch) });
      }
    } catch (error) {
      console.error('DefineWatch -- fetchData', error);
      this.props.dispatch(addErrorToast(error));
    }
  }

  onCancel = () => {
    const { history } = this.props;
    if (this.state.isEdit) {
      history.goBack();
    }
    history.push(APP_PATH.WATCHES);
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history, dispatch } = this.props;
    const { _id: id } = values;
    try {
      await this.watchService.put(formikToWatch(values), id);
      setSubmitting(false);
      dispatch(addSuccessToast((<p>{saveText} {id}</p>)));
      history.push(APP_PATH.WATCHES);
    } catch (error) {
      console.error('DefineWatch -- onSubmit', error);
      setSubmitting(false);
      dispatch(addErrorToast(error));
    }
  }

  render() {
    const { initialValues, isEdit } = this.state;
    const { httpClient, location, dispatch } = this.props;

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
                <h1>{isEdit ? updateWatchText : createWatchText}</h1>
              </EuiTitle>
              <EuiSpacer />
              <GeneralPanel httpClient={httpClient} location={location} />
              <EuiSpacer />
              <DefinitionPanel dispatch={dispatch} httpClient={httpClient} />
              <EuiSpacer />
              <FieldArray
                name="actions"
                render={arrayHelpers => (
                  <ActionPanel
                    arrayHelpers={arrayHelpers}
                    httpClient={httpClient}
                  />
                )}
              />
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

DefineWatch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired
};

export default connect()(DefineWatch);
