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
import { connect as connectRedux } from 'react-redux';
import { connect as connectFormik } from 'formik';
import { EuiSpacer, EuiLoadingChart } from '@elastic/eui';
import { cloneDeep, get, pick, isEqual } from 'lodash';
import { SubHeader } from '../../../../components';
import WatchIndex from '../WatchIndex';
import WatchTimeField from '../WatchTimeField';
import VisualGraph from '../VisualGraph';
import WatchExpressions from '../WatchExpressions';
import { mappingsToFieldNames, buildSearchRequest } from './utils';
import { addErrorToast } from '../../../../redux/actions';
import { ElasticsearchService, WatchService } from '../../../../services';
import { PAYLOAD_PATH, WATCH_TYPES, CHECK_MYSEARCH } from '../../utils/constants';
import {
  youMustSpecifyIndexText,
  youMustSpecifyATimeFieldText,
  matchConditionText,
} from '../../../../utils/i18n/watch';
import { comboBoxOptionsToArray, arrayToComboBoxOptions } from '../../../../utils/helpers';
import { getFieldsFromPayload, getFieldsForType } from '../../utils/helpers';

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

class GraphWatch extends Component {
  constructor(props) {
    super(props);

    const { httpClient, formik: { values = {} } } = this.props;

    this.state = {
      dataTypes: {},
      payloadFields: [],
      formikSnapshot: cloneDeep(values),
      isLoading: false
    };

    this.elasticsearchService = new ElasticsearchService(httpClient);
    this.watchService = new WatchService(httpClient);
  }

  componentDidMount() {
    const {
      formik: {
        values: {
          _ui: {
            index,
            timeField
          }
        }
      }
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
      'overDocuments', 'timeField', 'aggregationType',
      'fieldName', 'topHitsAgg', 'bucketValue', 'bucketUnitOfTime'
    ];
    const prevGraphQuery = JSON.stringify(pick(get(prevProps, 'formik.values._ui', {}), queryOptions));
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
    const { formik: { values }, dispatch } = this.props;
    try {
      const mappings = await this.queryMappings(comboBoxOptionsToArray(values._ui.index));
      const dataTypes = mappingsToFieldNames(mappings);
      this.setState({ dataTypes });
    } catch (err) {
      console.error('GraphWatch -- Fail getting mappings for query', err);
      dispatch(addErrorToast(err));
      console.debug('GraphWatch -- values', values);
    }
  }

  handlePayload = payload => {
    const payloadFields = [{
      label: 'number',
      options: arrayToComboBoxOptions(getFieldsForType(getFieldsFromPayload(payload), 'number'))
        .map(({ label }) => ({ label: `${PAYLOAD_PATH}.${label}` }))
    }];

    this.setState({ payloadFields });    
    console.debug('GraphWatch -- payloadFields', payloadFields);
  }

  queryMappings = index => {
    if (!index.length) return {};
    return this.elasticsearchService.getMappings(index).then(data => {
      if (data.ok) return data.resp;
      return {};
    });
  }

  onRunQuery = async () => {
    const { formik: { values, setFieldValue }, dispatch } = this.props;
    const formikSnapshot = cloneDeep(values);

    // If we are running a visual graph query, then we need to run two separate queries
    // 1. The actual query that will be saved on the watch, to get accurate query performance stats
    // 2. The UI generated query that gets [BUCKET_COUNT] times the aggregated buckets to show past
    // history of query
    // If the query is an extraction query, we can use the same query for results
    // and query performance
    const searchRequests = [buildSearchRequest(values)];
    searchRequests.push(buildSearchRequest(values, false));
    console.debug('GraphWatch -- searchRequests', searchRequests);

    this.setState({ isLoading: true });
    try {
      const promises = searchRequests.map(({ request }) => this.watchService.executeGraph(request));
      const [{ resp: graphQueryResponse }, { resp: realQueryResponse }] = await Promise.all(
        promises
      );
      console.debug('GraphWatch -- searchResponses', [graphQueryResponse, realQueryResponse]);

      this.handlePayload(realQueryResponse);

      this.setState({ formikSnapshot });
      setFieldValue('_ui.checksGraphResult', graphQueryResponse);
      setFieldValue('_ui.checksResult', { data: { [CHECK_MYSEARCH]: realQueryResponse } });
    } catch (err) {
      console.error('GraphWatch -- Fail running the query', err);
      dispatch(addErrorToast(err));
      console.debug('GraphWatch -- values', values);
    }
    this.setState({ isLoading: false });
  }

  renderGraph = () => {
    const { dataTypes, formikSnapshot, isLoading, payloadFields } = this.state;
    const {
      formik: { values },
    } = this.props;
    const response = values._ui.checksGraphResult || {};
    const fieldName = get(values, '_ui.fieldName[0].label', 'Select a field');

    return (
      <>
        <SubHeader title={<h4>{matchConditionText}</h4>} />
        <EuiSpacer size="m" />
        <WatchExpressions
          onRunQuery={this.onRunQuery}
          dataTypes={dataTypes}
          payloadFields={payloadFields}
          ofEnabled={values._ui.aggregationType !== 'count'}
        />
        <EuiSpacer size="s" />
        {
          isLoading
            ? <div style={{ margin: 'auto' }}><EuiLoadingChart size="xl" /></div>
            : <VisualGraph
              annotation
              values={formikSnapshot}
              fieldName={fieldName}
              response={response}
              thresholdValue={values._ui.thresholdValue}
              severityThresholds={values._ui.severity.thresholds}
            />
        }
      </>
    );
  }

  render() {
    const {
      httpClient,
      formik: {
        values: {
          _ui: { index, timeField },
        },
      },
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
    } = this.props;

    const { dataTypes } = this.state;

    let content = renderGraphMessage(youMustSpecifyIndexText);
    if (index.length) {
      content = timeField ? this.renderGraph() : renderGraphMessage(youMustSpecifyATimeFieldText);
    }

    return (
      <Fragment>
        <WatchIndex
          httpClient={httpClient}
          indexFieldName="_ui.index"
          onComboBoxChange={onComboBoxChange}
          onComboBoxOnBlur={onComboBoxOnBlur}
          onComboBoxCreateOption={onComboBoxCreateOption}
        />
        <WatchTimeField dataTypes={dataTypes} />

        <EuiSpacer />
        <div style={{ paddingTop: '10px' }}>{content}</div>
      </Fragment>
    );
  }
}

GraphWatch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  httpClient: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
};

export default connectRedux()(connectFormik(GraphWatch));
