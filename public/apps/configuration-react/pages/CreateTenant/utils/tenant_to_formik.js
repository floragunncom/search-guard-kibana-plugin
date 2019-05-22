const tenantToFormik = (tenant, id = '') => ({ _name: id, ...tenant });
export default tenantToFormik;
