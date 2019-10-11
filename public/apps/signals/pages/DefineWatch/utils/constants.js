import { startCase, cloneDeep } from 'lodash';

export const WATCH_TYPE = {
  GRAPH: 'graph',
  JSON: 'json',
  BLOCKS: 'blocks'
};

export const WATCH_CHECK_TYPE = {
  STATIC: 'static',
  SEARCH: 'search',
  CONDITION_SCRIPT: 'condition.script'
};

export const WATCH_TYPE_SELECT = [
  { value: WATCH_TYPE.GRAPH, text: startCase(WATCH_TYPE.GRAPH) },
  { value: WATCH_TYPE.JSON, text: startCase(WATCH_TYPE.JSON) },
  { value: WATCH_TYPE.BLOCKS, text: startCase(WATCH_TYPE.BLOCKS) }
];

export const WATCH_CHECK_SEARCH_NAME_DEFAULT = 'mysearch';
export const WATCH_CHECK_CONDITION_NAME_DEFAULT = 'mycondition';
export const BUCKET_COUNT = 5;
export const PAYLOAD_PATH = `data.${WATCH_CHECK_SEARCH_NAME_DEFAULT}`;
export const HITS_TOTAL_RESULTS_PATH = `${PAYLOAD_PATH}.hits.total.value`;
export const AGGREGATION_RESULTS_PATH = `${PAYLOAD_PATH}.aggregations.when.value`;

const CHECKS_DEFAULTS = [
  {
    type: WATCH_CHECK_TYPE.SEARCH,
    name: WATCH_CHECK_SEARCH_NAME_DEFAULT,
    target: WATCH_CHECK_SEARCH_NAME_DEFAULT,
    request: {
      indices: [],
      body: {
        from: 0,
        size: 10,
        query: {
          match_all: {}
        }
      }
    }
  },
  {
    type: WATCH_CHECK_TYPE.CONDITION_SCRIPT,
    name: WATCH_CHECK_CONDITION_NAME_DEFAULT,
    source: `${PAYLOAD_PATH}.hits.hits.length > 0`
  },
];

export const GRAPH_DEFAULTS = {
  watchType: WATCH_TYPE.GRAPH,
  index: [],
  timeField: '',
  aggregationType: 'count',
  fieldName: [],
  overDocuments: 'all documents',
  groupedOverTop: 5,
  groupedOverFieldName: 'bytes',
  bucketValue: 1,
  bucketUnitOfTime: 'h', // m = minute, h = hour, d = day
  thresholdValue: 1000,
  thresholdEnum: 'ABOVE',
};

export const TIMEZONE_DEFAULT = 'Europe/Berlin';

export const SCHEDULE_DEFAULTS = {
  frequency: 'interval',
  period: { interval: 1, unit: 'm' },
  cron: '0 */1 * * * ?',
  daily: 0,
  weekly: {
    mon: false, tue: false, wed: false,
    thu: false, fri: false, sat: false, sun: false
  },
  monthly: { type: 'day', day: 1 },
  timezone: [{ label: TIMEZONE_DEFAULT }],
};

export const RESULT_FIELD_DEFAULTS = {
  checksGraphResult: {},
  checksResult: '',
  checksBlocks: [],
};

export const META_FIELDS_TO_OMIT = [
  ...Object.keys(RESULT_FIELD_DEFAULTS),
  ...Object.keys(SCHEDULE_DEFAULTS)
];

export const DEFAULT_WATCH = {
  _id: '',
  active: true,
  trigger: {
    schedule: {
      interval: ['1m']
    }
  },
  checks: cloneDeep(CHECKS_DEFAULTS),
  actions: [],
  // TODO: dont store graph defaults when graph query builder is ready
  _ui: {
    ...GRAPH_DEFAULTS,
    ...RESULT_FIELD_DEFAULTS,
    ...SCHEDULE_DEFAULTS
  },
};
