import { pick } from 'lodash';

const formikToTenant = formik => pick(formik, ['description']);
export default formikToTenant;
