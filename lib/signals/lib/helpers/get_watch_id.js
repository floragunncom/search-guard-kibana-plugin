/**
 * 
 * @param {string} id - Watch id of type tenantName/watchName
 */
export const getWatchId = (id = '') => id.split('/').pop();
