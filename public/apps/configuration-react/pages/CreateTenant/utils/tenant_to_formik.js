const tenantToFormik = (tenant, id = '') => ({ name: id, ...tenant });
export default tenantToFormik;
