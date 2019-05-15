import { pick } from 'lodash';

const uiResourceToResource = resource => pick(resource, ['permissions', 'actiongroups']);

export default uiResourceToResource;
