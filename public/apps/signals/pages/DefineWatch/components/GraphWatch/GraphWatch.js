import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { EuiSpacer, EuiText } from '@elastic/eui';
import { cloneDeep, get } from 'lodash';
import WatchIndex from '../WatchIndex';
import WatchTimeField from '../WatchTimeField';
import VisualGraph from '../VisualGraph';
import WatchExpressions from '../WatchExpressions';
import { mappingsToFieldNames, buildSearchRequest } from './utils';
import { addErrorToast } from '../../../../redux/actions';
import { ElasticsearchService, WatchService } from '../../../../services';
import { WATCH_TYPE, WATCH_CHECK_SEARCH_NAME_DEFAULT } from '../../utils/constants';
import {
  youMustSpecifyIndexText,
  youMustSpecifyATimeFieldText
} from '../../../../utils/i18n/watch';

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
      formikSnapshot: cloneDeep(values)
    };

    this.elasticsearchService = new ElasticsearchService(httpClient);
    this.watchService = new WatchService(httpClient);
  }

  componentDidMount() {
    const { formik: { values: { _index, _timeField } } } = this.props;
    const hasIndices = !!_index.length;
    const hasTimeField = !!_timeField;
    if (hasIndices) {
      this.onQueryMappings();
      if (hasTimeField) this.onRunQuery();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      formik: {
        values: {
          _watchType: prevWatchType,
          _index: prevIndex,
          _timeField: prevTimeField,
        }
      }
    } = prevProps;
    const { formik: { values: { _index, _timeField } } } = this.props;
    const hasIndices = !!_index.length;
    // If customer is defining query through extraction query,
    // then they are manually running their own queries
    // Below logic is for customers defining queries through graph/visual way.
    if (hasIndices) {
      // If current query type is graph and there are indices selected,
      // then we want to query new index mappings if
      // a) previous query type was query (to get the first load of mappings)
      // b) different indices, to get new mappings
      const wasJson = prevWatchType !== WATCH_TYPE.GRAPH;
      const diffIndices = prevIndex !== _index;
      if (wasJson || diffIndices) {
        this.onQueryMappings();
      }
      // If there is a timeField selected, then we want to run the query if
      // a) previous query type was query (to get first run executed)
      // b) different indices, to get new data
      // c) different time fields, to aggregate on new data/axis
      const diffTimeFields = prevTimeField !== _timeField;
      const hasTimeField = !!_timeField;
      if (hasTimeField) {
        if (wasJson || diffIndices || diffTimeFields) this.onRunQuery();
      }
    }
  }

  onQueryMappings = async () => {
    const { formik: { values }, dispatch } = this.props;
    const index = values._index.map(({ label }) => label);
    try {
      const mappings = await this.queryMappings(index);
      const dataTypes = mappingsToFieldNames(mappings);
      this.setState({ dataTypes });
    } catch (err) {
      dispatch(addErrorToast(err));
      console.error('There was an error getting mappings for query', err);
    }
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
    console.log('GraphWatch -- searchRequests', searchRequests);

    try {
      const promises = searchRequests.map(({ request }) =>
        this.watchService.executeGraph(request));
      const [
        { resp: graphQueryResponse },
        { resp: realQueryResponse }
      ] = await Promise.all(promises);
      console.log('GraphWatch -- searchResponses', [graphQueryResponse, realQueryResponse]);

      this.setState({ formikSnapshot });
      setFieldValue('_checksGraphResult', graphQueryResponse);
      setFieldValue('_checksResult', { [WATCH_CHECK_SEARCH_NAME_DEFAULT]: realQueryResponse });
    } catch (err) {
      console.error('There was an error running the query', err);
      dispatch(addErrorToast(err));
    }
  }

  renderGraph = () => {
    const { dataTypes, formikSnapshot } = this.state;
    const { formik: { values } } = this.props;
    const response = values._checksGraphResult || {};
    const fieldName = get(values, '_fieldName[0].label', 'Select a field');

    return (
      <Fragment>
        <EuiText size="xs">
          <strong>Match condition</strong>
        </EuiText>
        <EuiSpacer size="s" />
        <WatchExpressions
          onRunQuery={this.onRunQuery}
          dataTypes={dataTypes}
          ofEnabled={values._aggregationType !== 'count'}
        />
        <EuiSpacer size="s" />
        <VisualGraph
          annotation
          values={formikSnapshot}
          fieldName={fieldName}
          response={response}
          thresholdValue={values._thresholdValue}
        />
      </Fragment>
    );
  }

  render() {
    const {
      httpClient,
      formik: { values: { _index, _timeField } },
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption
    } = this.props;

    const { dataTypes } = this.state;

    let content = renderGraphMessage(youMustSpecifyIndexText);
    if (_index.length) {
      content = _timeField
        ? this.renderGraph()
        : renderGraphMessage(youMustSpecifyATimeFieldText);
    }

    return (
      <Fragment>
        <WatchIndex
          httpClient={httpClient}
          indexFieldName="_index"
          onComboBoxChange={onComboBoxChange}
          onComboBoxOnBlur={onComboBoxOnBlur}
          onComboBoxCreateOption={onComboBoxCreateOption}
        />
        <WatchTimeField dataTypes={dataTypes} />
        <div style={{ paddingTop: '10px' }}>{content}</div>
        <EuiSpacer />
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
  onComboBoxChange: PropTypes.func.isRequired
};

export default connectFormik(GraphWatch);
