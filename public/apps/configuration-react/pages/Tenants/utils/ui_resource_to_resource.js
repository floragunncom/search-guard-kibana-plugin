import { omit } from 'lodash';

const uiResourceToResource = resource => omit(resource, ['hidden', 'reserved', 'static', 'id']);

export default uiResourceToResource;
