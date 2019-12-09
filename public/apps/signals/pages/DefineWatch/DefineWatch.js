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
import { get } from 'lodash';
import { WatchService } from '../../services';
import { addErrorToast, addSuccessToast } from '../../redux/actions';
import {
  watchToFormik,
  formikToWatch,
  buildChecks,
  buildFormikChecks
} from './utils';
import { DEFAULT_WATCH, WATCH_TYPES } from './utils/constants';
import {
  GeneralPanel,
  DefinitionPanel,
  ActionPanel,
  ResolveActionPanel
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
      isLoading: false,
      isEdit: !!id,
      initialValues: watchToFormik(DEFAULT_WATCH),
      insertCheckTemplate: {
        row: undefined,
        column: undefined,
        text: undefined,
      }
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { location, history, dispatch } = this.props;
    const { id } = queryString.parse(location.search);

    let initialValues;
    try {
      if (id) {
        const { resp } = await this.watchService.get(id);
        initialValues = watchToFormik(resp);
        this.setState({ initialValues });
      }
    } catch (error) {
      console.error('DefineWatch -- fetchData', error);
      if (error.statusCode === 404) {
        this.setState({ isEdit: false });
        history.push({ search: '' });
      } else {
        dispatch(addErrorToast(error));
      }
    }

    console.debug('DefineWatch -- fetchWatch -- id', id);
    console.debug('DefineWatch -- fetchWatch -- watch', initialValues);
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

    let watch;
    try {
      watch = formikToWatch(values);
      await this.watchService.put(watch, id);

      setSubmitting(false);
      dispatch(addSuccessToast((<p>{saveText} {id}</p>)));
      history.push(APP_PATH.WATCHES);
    } catch (error) {
      console.error('DefineWatch -- onSubmit', error);
      setSubmitting(false);
      dispatch(addErrorToast(error));
    }

    console.debug('DefineWatch -- onSubmit -- values', values);
    console.debug('DefineWatch -- onSubmit -- watch', watch);
  }

  handleChecksChange = () => {
    // TODO: rise state handling here
  };

  handleAddCheckTemplate = () => {
    // TODO: rise state handling here
  };

  handleExecuteChecks = () => {
    // TODO: rise state handling here
  };

  handleTriggerFlyout = () => {
    // TODO: rise state handling here
  };

  render() {
    const {
      initialValues,
      isEdit,
      isLoading,
      insertCheckTemplate
    } = this.state;

    const {
      httpClient,
      location,
      onTriggerFlyout,
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
          render={({ handleSubmit, isSubmitting, values, setFieldValue }) => {
            const isResolveActions = get(values, '_ui.isResolveActions', false);

            return (
              <Fragment>
                <EuiTitle size="l">
                  <h1>{isEdit ? updateWatchText : createWatchText}</h1>
                </EuiTitle>
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
                <EuiSpacer />
                <GeneralPanel httpClient={httpClient} location={location} />
                <EuiSpacer />
                <DefinitionPanel
                  httpClient={httpClient}
                  onTriggerFlyout={onTriggerFlyout}
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
                      isLoading={isLoading}
                      httpClient={httpClient}
                      arrayHelpers={arrayHelpers}
                      onComboBoxChange={onComboBoxChange}
                      onComboBoxOnBlur={onComboBoxOnBlur}
                      onComboBoxCreateOption={onComboBoxCreateOption}
                      onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
                      onChecksChange={this.handleChecksChange}
                      onAddCheckTemplate={checkTemplate => {
                        this.handleAddCheckTemplate(checkTemplate, values, setFieldValue);
                      }}
                      onExecuteChecks={this.handleExecuteChecks}
                      onTriggerFlyout={this.handleTriggerFlyout}
                      insertCheckTemplate={insertCheckTemplate}
                    />
                  )}
                />
                {isResolveActions && (
                  <>
                    <EuiSpacer />
                    <FieldArray
                      name="resolve_actions"
                      render={arrayHelpers => (
                        <ResolveActionPanel
                          isLoading={isLoading}
                          httpClient={httpClient}
                          arrayHelpers={arrayHelpers}
                          onComboBoxChange={onComboBoxChange}
                          onComboBoxOnBlur={onComboBoxOnBlur}
                          onComboBoxCreateOption={onComboBoxCreateOption}
                          onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
                          onChecksChange={this.handleChecksChange}
                          onAddCheckTemplate={this.handleAddCheckTemplate}
                          onExecuteChecks={this.handleExecuteChecks}
                          onTriggerFlyout={this.handleTriggerFlyout}
                          insertCheckTemplate={insertCheckTemplate}
                        />
                      )}
                    />
                  </>
                )}
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
            );
          }}
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
  onTriggerFlyout: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default connect()(DefineWatch);
