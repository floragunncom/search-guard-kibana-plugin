import { pick } from 'lodash';

const uiResourceToResource = resource => pick(resource, ['description']);

export default uiResourceToResource;
