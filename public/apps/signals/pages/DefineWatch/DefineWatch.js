/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik, FieldArray } from 'formik';
import queryString from 'query-string';
import { EuiTitle, EuiSpacer, EuiFlexItem, EuiFlexGroup, EuiErrorBoundary } from '@elastic/eui';
import { get } from 'lodash';
import { WatchService } from '../../services';
import { watchToFormik, formikToWatch } from './utils';
import { DEFAULT_WATCH, WATCH_TYPES, AGGREGATIONS_TYPES } from './utils/constants';
import { GeneralPanel, DefinitionPanel, ActionPanel, ResolveActionPanel } from './components';
import { CancelButton, SaveButton } from '../../components';
import { APP_PATH } from '../../utils/constants';
import { createWatchText, updateWatchText, requiredText } from '../../utils/i18n/watch';
import { updateText, createText, saveText } from '../../utils/i18n/common';

import { Context } from '../../Context';

class DefineWatch extends Component {
  static contextType = Context;

  constructor(props) {
    super(props);

    const { location, httpClient } = this.props;
    this.watchService = new WatchService(httpClient);
    const { id } = queryString.parse(location.search);

    this.state = {
      isLoading: false,
      isEdit: !!id,
      initialValues: watchToFormik(DEFAULT_WATCH),
    };

    console.debug('DefineWatch -- constructor -- values', this.state.initialValues);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { location, history } = this.props;
    const { id } = queryString.parse(location.search);
    if (!id) return;

    let initialValues;
    let watch;
    try {
      const { resp } = await this.watchService.get(id);
      watch = resp;
      console.debug('DefineWatch -- fetchWatch -- watch', watch);

      initialValues = watchToFormik(watch);
      this.setState({ initialValues });
    } catch (error) {
      console.error('DefineWatch -- fetchData', error);

      if (error.statusCode === 404) {
        this.setState({ isEdit: false });
        history.push({ search: '' });
      } else {
        this.context.addErrorToast(error);
      }
    }

    console.debug('DefineWatch -- fetchWatch -- id', id);
    console.debug('DefineWatch -- fetchWatch -- values', initialValues);
  };

  onCancel = () => {
    const { history } = this.props;
    if (this.state.isEdit) {
      history.goBack();
    }
    history.push(APP_PATH.WATCHES);
  };

  onSubmit = async (values, { setSubmitting, setFieldError }) => {
    const { history } = this.props;
    const { _id: id } = values;
    let watch;
    console.debug('DefineWatch -- onSubmit -- values', values);

    try {
      const isSeverity = get(values, '_ui.isSeverity', false);
      const isGraphWatch = get(values, '_ui.watchType') === WATCH_TYPES.GRAPH;
      const severityValue = get(values, '_ui.severity.value[0].label');
      const aggFieldName = get(values, '_ui.fieldName[0].label');
      const notCountAggType = get(values, '_ui.aggregationType') !== 'count';
      const isTopHits = get(values, '_ui.overDocuments') === AGGREGATIONS_TYPES.TOP_HITS;
      const topHitsField = get(values, '_ui.topHitsAgg.field[0].label');

      // The graph watch condition expressions combobox fieds (severity, aggregation, top hits, etc.) are hidden.
      // They are visible only in a popup after you clicked on the related expression.
      // Formik doesn't check these fields validity on submit automatically.
      const shouldSetSeverityField = isGraphWatch && isSeverity && !severityValue;
      const shouldSetAggregationField = isGraphWatch && notCountAggType && !aggFieldName;
      const shouldSetTopHitsField = isGraphWatch && isTopHits && !topHitsField;
      const formErrors = {};

      if (shouldSetSeverityField) {
        formErrors['_ui.severity.value'] = requiredText;
      }

      if (shouldSetAggregationField) {
        formErrors['_ui.fieldName'] = requiredText;
      }

      if (shouldSetTopHitsField) {
        formErrors['_ui.topHitsAgg.field'] = requiredText;
      }

      console.debug('DefineWatch, onSubmit, formErrors', formErrors);
      Object.keys(formErrors).forEach((field) => {
        setFieldError(field, formErrors[field]);
      });

      const mustCancelSubmit =
        shouldSetAggregationField || shouldSetSeverityField || shouldSetTopHitsField;
      if (mustCancelSubmit) {
        setSubmitting(false);
        return;
      }

      watch = formikToWatch(values);
      await this.watchService.put(watch, id);

      setSubmitting(false);
      this.context.addSuccessToast(
        <p>
          {saveText} {id}
        </p>
      );
      history.push(APP_PATH.WATCHES);
    } catch (error) {
      console.error('DefineWatch -- onSubmit', error);
      setSubmitting(false);
      this.context.addErrorToast(error);
    }

    console.debug('DefineWatch -- onSubmit -- watch', watch);
  };

  render() {
    const { initialValues, isEdit, isLoading } = this.state;
    const { httpClient, location, onTriggerConfirmDeletionModal } = this.props;

    return (
      <EuiErrorBoundary>
        <Formik
          initialValues={initialValues}
          onSubmit={this.onSubmit}
          validateOnChange={false}
          enableReinitialize
          render={({ handleSubmit, isSubmitting, values }) => {
            const isResolveActions = get(values, '_ui.isResolveActions', false);

            return (
              <>
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
                <GeneralPanel location={location} />
                <EuiSpacer />
                <DefinitionPanel />
                <EuiSpacer />
                <FieldArray
                  name="actions"
                  render={(arrayHelpers) => (
                    <ActionPanel
                      isLoading={isLoading}
                      httpClient={httpClient}
                      arrayHelpers={arrayHelpers}
                      onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
                    />
                  )}
                />
                {isResolveActions && (
                  <>
                    <EuiSpacer />
                    <FieldArray
                      name="resolve_actions"
                      render={(arrayHelpers) => (
                        <ResolveActionPanel
                          isLoading={isLoading}
                          httpClient={httpClient}
                          arrayHelpers={arrayHelpers}
                          onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
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
              </>
            );
          }}
        />
      </EuiErrorBoundary>
    );
  }
}

DefineWatch.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.object.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
};

export default DefineWatch;
