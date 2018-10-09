import Joi from 'joi'

export default Joi.object().keys({
    cluster: Joi.array().items(Joi.string()),
    //tenants: Joi.object().pattern(/.*/, Joi.alternatives().try("RO", "RW")),
    tenants: Joi.object()
        .pattern(/.*/, Joi.object()
            .pattern(/.*/, Joi.array().items(Joi.string()))
        ),
    applications: Joi.array().items(Joi.string()),
    indices: Joi.object()
            // indices, everything allowed
            .pattern(/.*/, Joi.object({
            // dls and fls keys, fixed
            _dls_: Joi.string(),
            _fls_: Joi.array().items(Joi.string())
            })
            // doctypes, everything allowed
            .pattern(/.*/, Joi.array().items(Joi.string())
    ))
});
