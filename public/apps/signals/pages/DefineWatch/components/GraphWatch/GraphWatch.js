/* eslint-disable @kbn/eslint/require-license-header */
/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright 2015-2019 _floragunn_ GmbH
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiLoadingChart, EuiErrorBoundary } from '@elastic/eui';
import { get, pick, isEqual, cloneDeep } from 'lodash';
import { SubHeader } from '../../../../components';
import WatchIndex from '../WatchIndex';
import WatchTimeField from '../WatchTimeField';
import VisualGraph from '../VisualGraph';
import WatchExpressions from '../WatchExpressions';
import { ElasticsearchService, WatchService } from '../../../../services';
import { WATCH_TYPES, CHECK_MYSEARCH } from '../../utils/constants';
import {
  youMustSpecifyIndexText,
  youMustSpecifyATimeFieldText,
  matchConditionText,
} from '../../../../utils/i18n/watch';
import { comboBoxOptionsToArray } from '../../../../utils/helpers';
import {
  mappingsToFieldNames,
  buildSearchRequest,
  getPayloadFieldsForWatchExpressions,
} from './utils';
import { formikToWatch } from '../../utils';

import { Context } from '../../../../Context';

function renderGraphMessage(message) {
  return (
    <div style={{ padding: '20px', border: '1px solid #D9D9D9', borderRadius: '5px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '450px' }}
      >
        <div id="graph-message">{message}</div>
      </div>
    </div>
  );
}

export async function runQuery({ values, watchService }) {
  try {
    const searchRequests = [buildSearchRequest(values), buildSearchRequest(values, false)];
    console.debug('GraphWatch, runQuery, searchRequests', searchRequests);

    const searchRequestPromises = searchRequests.map((request) => {
      const watch = { ...formikToWatch(values), checks: [request], actions: [] };
      delete watch.severity; // Avoid annoying error toasts while setting the graph expressions.
      return watchService.execute({ watch, skipActions: true });
    });

    const [graphResult, result] = await Promise.all(searchRequestPromises).then(
      ([graphResult, result]) => {
        console.debug('GraphWatch, runQuery, searchResponses', [graphResult, result]);
        if (!graphResult.ok) throw graphResult.resp;
        if (!result.ok) throw result.resp;
        return [graphResult.resp, result.resp];
      }
    );

    const payloadFields = getPayloadFieldsForWatchExpressions(result);
    console.debug('GraphWatch, runQuery, payloadFields', payloadFields);

    return {
      result,
      payloadFields,
      graphResult: get(graphResult, `runtime_attributes.data[${CHECK_MYSEARCH}]`, {}),
    };
  } catch (error) {
    throw error;
  }
}

export class GraphWatch extends Component {
  static contextType = Context;

  constructor(props) {
    super(props);

    const { httpClient } = this.props;

    this.state = {
      dataTypes: {},
      payloadFields: [],
      isLoading: false,
    };

    this.elasticsearchService = new ElasticsearchService(httpClient);
    this.watchService = new WatchService(httpClient);
  }

  componentDidMount() {
    const {
      formik: {
        values: {
          _ui: { index, timeField },
        },
      },
    } = this.props;

    const hasIndices = !!index.length;
    const hasTimeField = !!timeField;

    if (hasIndices) {
      this.onQueryMappings();
      if (hasTimeField) this.onRunQuery();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      formik: { setFieldValue },
    } = this.props;

    const prevWatchType = get(prevProps, 'formik.values._ui.watchType');
    const timeField = get(this.props, 'formik.values._ui.timeField');
    const prevIndex = get(prevProps, 'formik.values._ui.index');
    const index = get(this.props, 'formik.values._ui.index');
    const prevIsSeverity = get(prevProps, 'formik.values._ui.isSeverity');
    const isSeverity = get(this.props, 'formik.values._ui.isSeverity');

    // Having the old value in the fieldName prevents user seeing new field options
    // for a newly selected indices if there is only one option available.
    // Issue: https://floragunn.atlassian.net/browse/LRT-766
    const wereAllIndicesRemoved = !isEqual(index, prevIndex) && !index.length;
    if (wereAllIndicesRemoved) {
      setFieldValue('_ui.fieldName', []);
    }

    const queryOptions = [
      'overDocuments',
      'timeField',
      'aggregationType',
      'fieldName',
      'topHitsAgg',
      'bucketValue',
      'bucketUnitOfTime',
    ];
    const prevGraphQuery = JSON.stringify(
      pick(get(prevProps, 'formik.values._ui', {}), queryOptions)
    );
    const graphQuery = JSON.stringify(pick(get(this.props, 'formik.values._ui', {}), queryOptions));

    const hasIndices = !!index.length;
    // If customer is defining query through extraction query,
    // then they are manually running their own queries
    // Below logic is for customers defining queries through graph/visual way.
    if (hasIndices) {
      // If current query type is graph and there are indices selected,
      // then we want to query new index mappings if
      // a) previous query type was query (to get the first load of mappings)
      // b) different indices, to get new mappings
      const wasJson = prevWatchType !== WATCH_TYPES.GRAPH;
      const diffIndices = prevIndex !== index;
      if (wasJson || diffIndices) {
        this.onQueryMappings();
      }
      // If there is a timeField selected, then we want to run the query if
      // a) previous query type was query (to get first run executed)
      // b) different indices, to get new data
      // c) different query values
      // e) switched severity on/off
      const diffGraphQuery = prevGraphQuery !== graphQuery;
      const switchedSeverity = prevIsSeverity !== isSeverity;
      const hasTimeField = !!timeField;
      if (hasTimeField) {
        if (wasJson || diffIndices || diffGraphQuery || switchedSeverity) {
          setTimeout(() => {
            this.onRunQuery();
          }, 1502);
        }
      }
    }
  }

  onQueryMappings = async () => {
    const {
      formik: { values },
    } = this.props;
    try {
      const mappings = await this.queryMappings(comboBoxOptionsToArray(values._ui.index));
      const dataTypes = mappingsToFieldNames(mappings);
      this.setState({ dataTypes });
    } catch (err) {
      console.error('GraphWatch, onQueryMappings', err);
      this.context.addErrorToast(err);
    }
  };

  queryMappings = index => {
    if (!index.length) return {};
    return this.elasticsearchService.getMappings(index).then(data => {
      if (data.ok) return data.resp;
      return {};
    });
  };

  onRunQuery = async () => {
    const {
      formik: { values, setFieldValue },
    } = this.props;

    this.setState({ isLoading: true });

    try {
      const { payloadFields, result, graphResult } = await runQuery({
        values,
        watchService: this.watchService,
      });

      this.setState({ payloadFields });
      setFieldValue('_ui.checksResult', result);
      setFieldValue('_ui.checksGraphResult', graphResult);
    } catch (err) {
      console.error('GraphWatch, onRunQuery', err);
      console.debug('GraphWatch, onRunQuery, values', values);
      this.context.addErrorToast(err);
    }

    this.setState({ isLoading: false });
  };

  renderGraph = () => {
    const { dataTypes, isLoading, payloadFields } = this.state;
    const {
      formik: { values },
    } = this.props;
    const response = get(values, '_ui.checksGraphResult', {});
    const fieldName = get(values, '_ui.fieldName[0].label', 'Select a field');

    return (
      <EuiErrorBoundary>
        <SubHeader title={<h4>{matchConditionText}</h4>} />
        <EuiSpacer size="m" />
        <WatchExpressions
          onRunQuery={this.onRunQuery}
          dataTypes={dataTypes}
          payloadFields={payloadFields}
          ofEnabled={values._ui.aggregationType !== 'count'}
        />
        <EuiSpacer size="s" />
        {isLoading ? (
          <div style={{ margin: 'auto' }}>
            <EuiLoadingChart size="xl" />
          </div>
        ) : (
          <VisualGraph annotation values={values} fieldName={fieldName} response={response} />
        )}
      </EuiErrorBoundary>
    );
  };

  render() {
    const {
      httpClient,
      formik: {
        values: {
          _ui: { index, timeField },
        },
      },
    } = this.props;

    const { dataTypes } = this.state;

    let content = renderGraphMessage(youMustSpecifyIndexText);
    if (index.length) {
      content = timeField ? this.renderGraph() : renderGraphMessage(youMustSpecifyATimeFieldText);
    }

    return (
      <Fragment>
        <WatchIndex httpClient={httpClient} indexFieldName="_ui.index" />
        <WatchTimeField dataTypes={dataTypes} />

        <EuiSpacer />
        <div style={{ paddingTop: '10px' }}>{content}</div>
      </Fragment>
    );
  }
}

GraphWatch.propTypes = {
  httpClient: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired,
};
