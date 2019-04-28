import Joi from 'joi'

export default Joi.object().keys({
    cluster_permissions: Joi.array().items(Joi.string()).optional(),
    tenant_permissions: Joi.array(),
    index_permissions: Joi.array()
});
