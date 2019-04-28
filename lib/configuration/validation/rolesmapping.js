import Joi from 'joi'

export default Joi.object().keys({
    backend_roles: Joi.array().items(Joi.string()),
    hosts: Joi.array().items(Joi.string()),
    users: Joi.array().items(Joi.string())
});
