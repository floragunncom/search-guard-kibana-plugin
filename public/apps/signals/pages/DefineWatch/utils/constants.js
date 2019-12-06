import { startCase, cloneDeep } from 'lodash';

export const WATCH_TYPES = {
  GRAPH: 'graph',
  JSON: 'json',
  BLOCKS: 'blocks'
};

export const CHECK_TYPES = {
  STATIC: 'static',
  SEARCH: 'search',
  CONDITION_SCRIPT: 'condition.script'
};

export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

export const SEVERITY_COLORS = {
  info: '#ccd5e2',
  warning: '#d7a64e',
  error: '#cf5e59',
  critical: '#000000',
  none: '#ffffff'
};

export const SEVERITY_OPTIONS = [
  { label: SEVERITY.INFO, color: SEVERITY_COLORS.info },
  { label: SEVERITY.WARNING, color: SEVERITY_COLORS.warning },
  { label: SEVERITY.ERROR, color: SEVERITY_COLORS.error },
  { label: SEVERITY.CRITICAL, color: SEVERITY_COLORS.critical }
];

export const SEVERITY_ORDER = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending'
};

export const SEVERITY_META_DEFAULTS = {
  isSeverity: false,
  isResolveActions: false,
  severity: {
    value: [{ label: '' }],
    order: SEVERITY_ORDER.ASCENDING,
    thresholds: {
      [SEVERITY.INFO]: 100,
      [SEVERITY.WARNING]: 200,
      [SEVERITY.ERROR]: 300,
      [SEVERITY.CRITICAL]: 400
    }
  }
};

export const ALL_DOCUMENTS = 'all documents';

export const AGGREGATIONS_TYPES = {
  TOP_HITS: 'top_hits',
  COUNT: 'count',
  AVG: 'avg',
  SUM: 'sum',
  MIN: 'min',
  MAX: 'max'
};

export const WATCH_TYPES_OPTIONS = [
  { value: WATCH_TYPES.GRAPH, text: startCase(WATCH_TYPES.GRAPH) },
  { value: WATCH_TYPES.JSON, text: startCase(WATCH_TYPES.JSON) },
  { value: WATCH_TYPES.BLOCKS, text: startCase(WATCH_TYPES.BLOCKS) }
];

export const CHECK_MYSEARCH = 'mysearch';
export const CHECK_MYCONDITION = 'mycondition';
export const PAYLOAD_PATH = `data.${CHECK_MYSEARCH}`;

const CHECKS_DEFAULTS = [
  {
    type: CHECK_TYPES.SEARCH,
    name: CHECK_MYSEARCH,
    target: CHECK_MYSEARCH,
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
    type: CHECK_TYPES.CONDITION_SCRIPT,
    name: CHECK_MYCONDITION,
    source: `${PAYLOAD_PATH}.hits.hits.length > 0`
  },
];

export const GRAPH_DEFAULTS = {
  isSeverity: false,
  watchType: WATCH_TYPES.GRAPH,
  index: [],
  timeField: '',
  aggregationType: AGGREGATIONS_TYPES.COUNT,
  fieldName: [],
  topHitsAgg: {
    field: [],
    size: 3,
    order: 'asc',
  },
  overDocuments: ALL_DOCUMENTS,
  bucketValue: 1,
  bucketUnitOfTime: 'h', // m = minute, h = hour, d = day
  thresholdValue: 1000,
  thresholdEnum: 'ABOVE',
};

export const TIMEZONE_DEFAULT = 'Europe/Berlin';

// ATTENTION! Unit order here is important for match and validation
export const TIME_PERIOD_UNITS = {
  WEEKS: 'w',
  DAYS: 'd',
  HOURS: 'h',
  MINUTES: 'm',
  SECONDS: 's',
  MILLISECONDS: 'ms',
};

// for example, 1h30m or 1h30m**2|2d12h for exponential throttle period
export const ADVANCED_TIME_PERIOD_UNIT = 'advanced';

export const TIME_INTERVAL_OPTIONS = [
  { value: TIME_PERIOD_UNITS.MILLISECONDS, text: 'Milliseconds' },
  { value: TIME_PERIOD_UNITS.SECONDS, text: 'Seconds' },
  { value: TIME_PERIOD_UNITS.MINUTES, text: 'Minutes' },
  { value: TIME_PERIOD_UNITS.HOURS, text: 'Hours' },
  { value: TIME_PERIOD_UNITS.DAYS, text: 'Days' },
  { value: TIME_PERIOD_UNITS.WEEKS, text: 'Weeks' },
  { value: ADVANCED_TIME_PERIOD_UNIT, text: 'Advanced' },
];

export const SCHEDULE_DEFAULTS = {
  frequency: 'interval',
  period: {
    interval: 1,
    advInterval: '1h30m15s',
    unit: TIME_PERIOD_UNITS.MINUTES,
  },
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
  ...Object.keys(SCHEDULE_DEFAULTS),
  'state' // watch execution status
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
    ...SCHEDULE_DEFAULTS,
    ...SEVERITY_META_DEFAULTS
  },
  _meta: {} // Server plugin meta
};
