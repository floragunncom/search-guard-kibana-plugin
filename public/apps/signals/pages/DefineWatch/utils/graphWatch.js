import momentTimezone from 'moment-timezone';
import moment from 'moment';
import { get } from 'lodash';
import dateMath from '@elastic/datemath';
import {
  CHECK_TYPES,
  CHECK_MYCONDITION,
  CHECK_MYSEARCH,
  PAYLOAD_PATH,
  AGGREGATIONS_TYPES
} from './constants';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

export const BUCKET_COUNT = 5;
export const ALL_DOCS_COUNT_VALUE_PATH = `${PAYLOAD_PATH}.hits.total.value`;
export const ALL_DOCS_METRIC_AGG_PATH = `${PAYLOAD_PATH}.aggregations.metricAgg.value`;
export const TOP_HITS_BUCKETS_PATH = `${PAYLOAD_PATH}.aggregations.bucketAgg.buckets`;

const getDateHistogramOptions = ({
  bucketValue,
  bucketUnitOfTime,
  timeField
}) => {
  const min = `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`;
  const max = 'now';

  const minDate = dateMath.parse(min);
  const maxDate = dateMath.parse(max);
  const numberOfBuckets = moment(maxDate.diff(minDate, 'seconds')) * 0.05 + 's';

  return {
    field: timeField,
    fixed_interval: numberOfBuckets,
    time_zone: momentTimezone.tz.guess(),
    min_doc_count: 0,
    extended_bounds: { min, max }
  };
};

export const buildAllDocsAgg = ({
  aggregationType,
  fieldName: [{ label: field } = {}],
}) => {
  if (aggregationType === 'count' || !field) return {};
  return { metricAgg: { [aggregationType]: { field } } };
};

export const buildAllDocsQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName
}) => {
  const whenAggregation = buildAllDocsAgg({ aggregationType, fieldName });
  const gte = `now-${Math.round(bucketValue)}${bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations: whenAggregation,
    query: {
      bool: {
        filter: {
          range: {
            [timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const buildUiAllDocsAgg = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName
}) => {
  const whenAggregation = buildAllDocsAgg({ aggregationType, fieldName });

  const dateHistogram = getDateHistogramOptions({
    bucketValue,
    bucketUnitOfTime,
    timeField
  });

  return {
    dateAgg: {
      date_histogram: dateHistogram,
      aggregations: whenAggregation
    }
  };
};

export const buildUiAllDocsQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName
}) => {
  const overAggregation = buildUiAllDocsAgg({
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName
  });

  // default range window to [BUCKET_COUNT] * the date histogram interval
  const gte = `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations: overAggregation,
    query: {
      bool: {
        filter: {
          range: {
            [timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const getOperator = thresholdEnum =>
  ({ ABOVE: '>', BELOW: '<', EXACTLY: '==' }[thresholdEnum]);

export const buildAllDocsCondition = ({
  thresholdValue,
  thresholdEnum,
  aggregationType
}) => {
  const resultsPath = aggregationType === 'count'
    ? ALL_DOCS_COUNT_VALUE_PATH
    : ALL_DOCS_METRIC_AGG_PATH;
  const operator = getOperator(thresholdEnum);

  return {
    type: CHECK_TYPES.CONDITION_SCRIPT,
    name: CHECK_MYCONDITION,
    source: `${resultsPath} ${operator} ${thresholdValue}`
  };
};

export const buildTopHitsCondition = ({
  thresholdValue,
  thresholdEnum,
  aggregationType
}) => {
  const operator = getOperator(thresholdEnum);
  const source = aggregationType === 'count'
    // eslint-disable-next-line max-len
    ? `ArrayList arr = ${TOP_HITS_BUCKETS_PATH}; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count ${operator} ${thresholdValue}) { return true; } } return false;`
    // eslint-disable-next-line max-len
    : `ArrayList arr = ${TOP_HITS_BUCKETS_PATH}; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value ${operator} ${thresholdValue}) { return true; } } return false;`;

  return {
    type: CHECK_TYPES.CONDITION_SCRIPT,
    name: CHECK_MYCONDITION,
    source
  };
};

export const buildTopHitsAgg = ({
  aggregationType,
  fieldName,
  topHitsAgg,
}) => {
  const metricAggField = get(fieldName, '[0].label', null);
  const topHitsField = get(topHitsAgg, 'field[0].label', null);
  if (aggregationType !== 'count' && (!metricAggField || !topHitsField)) {
    return {};
  }

  const { size, order } = topHitsAgg;

  if (aggregationType === 'count') {
    if (!topHitsField) return {};

    return {
      bucketAgg: {
        terms: {
          field: topHitsField,
          size,
          order: {
            _count: order,
          },
        },
      },
    };
  }

  return {
    bucketAgg: {
      terms: {
        field: topHitsField,
        size,
        order: {
          metricAgg: order,
        },
      },
      aggregations: {
        metricAgg: {
          [aggregationType]: {
            field: metricAggField,
          },
        },
      },
    },
  };
};

export const buildUiTopHitsAgg = ({
  aggregationType,
  fieldName,
  topHitsAgg,
  bucketValue,
  bucketUnitOfTime,
  timeField,
}) => {
  const metricAggField = get(fieldName, '[0].label', null);
  const topHitsField = get(topHitsAgg, 'field[0].label', null);

  const { bucketAgg: { terms, aggregations } = {} } = buildTopHitsAgg({
    aggregationType,
    fieldName,
    topHitsAgg,
  });

  const dateHistogram = getDateHistogramOptions({
    bucketValue,
    bucketUnitOfTime,
    timeField
  });

  if (aggregationType === 'count' || !metricAggField || !topHitsField) {
    if (!terms) return {};

    return {
      bucketAgg: {
        terms,
        aggregations: {
          dateAgg: {
            date_histogram: dateHistogram,
          },
        },
      },
    };
  }

  if (!aggregations) return {};

  aggregations.dateAgg = {
    date_histogram: dateHistogram,
    aggregations: {
      metricAgg: {
        [aggregationType]: {
          field: metricAggField,
        },
      },
    },
  };

  return { bucketAgg: { terms, aggregations } };
};

export const buildUiTopHitsQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName,
  topHitsAgg,
}) => {
  const aggregations = buildUiTopHitsAgg({
    aggregationType,
    fieldName,
    topHitsAgg,
    bucketValue,
    bucketUnitOfTime,
    timeField,
  });

  // default range window to [BUCKET_COUNT] * the date histogram interval
  const gte = `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations,
    query: {
      bool: {
        filter: {
          range: {
            [timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const buildTopHitsQuery = ({
  aggregationType,
  fieldName,
  topHitsAgg,
  timeField,
  bucketValue,
  bucketUnitOfTime,
}) => {
  const aggregations = buildTopHitsAgg({
    aggregationType,
    fieldName,
    topHitsAgg,
  });

  // default range window to [BUCKET_COUNT] * the date histogram interval
  const gte = `now-${bucketValue * BUCKET_COUNT}${bucketUnitOfTime}`;
  const lte = 'now';

  return {
    size: 0,
    aggregations,
    query: {
      bool: {
        filter: {
          range: {
            [timeField]: { gte, lte },
          },
        },
      },
    },
  };
};

export const buildUiGraphQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName,
  overDocuments,
  topHitsAgg,
}) => {
  if (overDocuments === AGGREGATIONS_TYPES.TOP_HITS) {
    return buildUiTopHitsQuery({
      aggregationType,
      fieldName,
      topHitsAgg,
      bucketValue,
      bucketUnitOfTime,
      timeField,
    });
  }

  return buildUiAllDocsQuery({
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName,
    overDocuments,
  });
};

export const buildGraphQuery = ({
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName,
  overDocuments,
  topHitsAgg,
}) => {
  if (overDocuments === AGGREGATIONS_TYPES.TOP_HITS) {
    return buildTopHitsQuery({
      aggregationType,
      fieldName,
      topHitsAgg,
      timeField,
      bucketValue,
      bucketUnitOfTime,
    });
  }

  return buildAllDocsQuery({
    bucketValue,
    bucketUnitOfTime,
    timeField,
    aggregationType,
    fieldName,
    overDocuments,
  });
};

export const buildCondition = ({
  thresholdValue,
  thresholdEnum,
  aggregationType,
  overDocuments,
}) => {
  if (overDocuments === AGGREGATIONS_TYPES.TOP_HITS) {
    return buildTopHitsCondition({
      thresholdValue,
      thresholdEnum,
      aggregationType,
    });
  }

  return buildAllDocsCondition({
    thresholdValue,
    thresholdEnum,
    aggregationType,
  });
};

export const buildGraphWatchChecks = ({
  index,
  bucketValue,
  bucketUnitOfTime,
  timeField,
  aggregationType,
  fieldName,
  thresholdValue,
  thresholdEnum,
  overDocuments,
  topHitsAgg,
}) => {
  const query = {
    type: CHECK_TYPES.SEARCH,
    name: CHECK_MYSEARCH,
    target: CHECK_MYSEARCH,
    request: {
      indices: comboBoxOptionsToArray(index),
      body: buildGraphQuery({
        bucketValue,
        bucketUnitOfTime,
        timeField,
        aggregationType,
        fieldName,
        overDocuments,
        topHitsAgg,
      }),
    },
  };

  const condition = buildCondition({
    thresholdValue,
    thresholdEnum,
    aggregationType,
    overDocuments,
  });

  return [ query, condition ];
};
