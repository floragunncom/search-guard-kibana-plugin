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
      isEdit: !!id,
      initialValues: watchToFormik(DEFAULT_WATCH)
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { location, history, dispatch } = this.props;
    const { id } = queryString.parse(location.search);

    let watch;
    try {
      if (id) {
        const { resp } = await this.watchService.get(id);
        watch = resp;
        this.setState({ initialValues: watchToFormik(watch) });
      }
    } catch (error) {
      console.error('DefineWatch -- fetchData', error);

      if (error.statusCode === 404) {
        this.setState({ isEdit: false });
        history.push({ search: '' });
      } else {
        dispatch(addErrorToast(error));
      }

      console.debug('DefineWatch -- id', id);
      console.debug('DefineWatch -- watch', watch);
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
      console.debug('DefineWatch -- formik values', values);
    }
  }

  render() {
    const { initialValues, isEdit } = this.state;
    const {
      httpClient,
      location,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
      onTriggerConfirmDeletionModal
    } = this.props;

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
              <DefinitionPanel
                httpClient={httpClient}
                onComboBoxChange={onComboBoxChange}
                onComboBoxOnBlur={onComboBoxOnBlur}
                onComboBoxCreateOption={onComboBoxCreateOption}
                onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
              />
              <EuiSpacer />
              <FieldArray
                name="actions"
                render={arrayHelpers => (
                  <ActionPanel
                    httpClient={httpClient}
                    arrayHelpers={arrayHelpers}
                    onComboBoxChange={onComboBoxChange}
                    onComboBoxOnBlur={onComboBoxOnBlur}
                    onComboBoxCreateOption={onComboBoxCreateOption}
                    onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
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
                    value={isEdit ? updateText : createText}
                    onClick={handleSubmit}
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
  httpClient: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default connect()(DefineWatch);
