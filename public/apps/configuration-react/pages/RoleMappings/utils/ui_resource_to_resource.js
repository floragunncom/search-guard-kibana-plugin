import { omit } from 'lodash';

const uiResourceToResource = resource => omit(resource, ['_id', 'hidden', 'reserved', 'static']);

export default uiResourceToResource;
