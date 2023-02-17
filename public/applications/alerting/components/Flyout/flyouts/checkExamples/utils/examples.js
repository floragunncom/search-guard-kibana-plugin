import { DOC_LINKS } from '../../../../../utils/constants';
import { CHECKS } from './constants';

const staticExamples = {
  [CHECKS.STATIC]: {
    constants: {
      example: {
        type: 'static',
        name: 'constants',
        target: 'constants',
        value: {
          threshold: 0
        }
      },
      link: DOC_LINKS.INPUTS.STATIC,
      type: 'static'
    }
  }
};

const conditionExamples = {
  [CHECKS.CONDITION]: {
    comparison: {
      example: {
        type: 'condition',
        name: 'greater_then_threshold',
        source: 'data.mysearch.hits.total.value > data.constants.threshold'
      },
      link: DOC_LINKS.CONDITIONS,
      type: 'condition'
    }
  }
};

const transformExamples = {
  [CHECKS.TRANSFORM]: {
    reduce_payload_to_one_value: {
      example: {
        type: 'transform',
        name: 'total_4_dials_time',
        source: `  long total_hits = data.mysearch.hits.total.value;
  long dials = 4;
  long total_4dials = 0;
  for (long i = 0; i < total_hits; i++) {
    total_4dials += i%dials;
  }
  return total_4dials;`
      },
      link: DOC_LINKS.TRANSFORMS,
      type: 'transform'
    },
  }
};

const calcExamples = {
  [CHECKS.CALC]: {
    calculate_new_field_value: {
      example: {
        type: 'calc',
        name: 'calc_mean_amount',
        source: 'data.mysearch.hits.total100 = data.mysearch.hits.total.value * 100'
      },
      link: DOC_LINKS.CALCS,
      type: 'calc'
    },
  }
};

const inputExamples = {
  [CHECKS.HTTP]: {
    call_external_service_with_basic_auth: {
      example: {
        type: 'http',
        name: 'http',
        request: {
          method: 'GET',
          url: 'https://localhost:9200/_cluster/stats',
          auth: {
            type: 'basic',
            username: 'admin',
            password: 'admin'
          }
        }
      },
      link: DOC_LINKS.INPUTS.HTTP,
      type: 'http'
    },
    call_external_service_with_params: {
      example: {
        type: 'http',
        name: 'http',
        request: {
          method: 'POST',
          url: 'https://webhook.site/a663a74a-592b-4efd-ad22-54a6da966e47',
          query_params: '{ "lat": "45.692783", "long": "9.673531" }'
        }
      },
      link: DOC_LINKS.INPUTS.HTTP,
      type: 'http'
    },
  },
  [CHECKS.FULL_TEXT]: {
    match: {
      example: {
        query: {
          match: {
            message: 'this is a test'
          }
        }
      },
      link: 'https://opensearch.org/docs/opensearch/query-dsl/full-text/',
    },
  },
};

export default {
  staticExamples,
  inputExamples,
  conditionExamples,
  transformExamples,
  calcExamples
};
