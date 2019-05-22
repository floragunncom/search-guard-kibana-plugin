import { omit } from 'lodash';

const uiResourceToResource = resource => omit(resource, ['hidden', 'reserved', 'static', '_id']);

export default uiResourceToResource;
