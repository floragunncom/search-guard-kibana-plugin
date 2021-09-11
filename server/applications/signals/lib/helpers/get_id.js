/* eslint-disable @osd/eslint/require-license-header */
/**
 *
 * @param {string} id - Watch id of type tenantName/watchName or
 * account id of type typeName/accountName
 */
export const getId = (id = '') => id.split('/').pop();
