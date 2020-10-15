/* eslint-disable @kbn/eslint/require-license-header */
import { get } from 'lodash';
import { parse } from 'url';
import { tenantNameToUiTenantName } from '../../../common';

export function addTenantToShareURL() {
  document.addEventListener('copy', event => {
    const shareButton = document.querySelector('[data-share-url]');
    const target = document.querySelector('body > span');
    // The copy event listens to Cmd + C too, so we need to make sure
    if (shareButton && target && shareButton.getAttribute('data-share-url') == target.textContent) {
      const originalValue = target.textContent;
      let urlPart = originalValue;

      // We need to figure out where in the value to add the tenant.
      // Since Kibana sometimes adds values that aren't in the current location/url,
      // we need to use the actual input values to do a sanity check.
      try {
        // For the iFrame urls we need to parse out the src
        if (originalValue.toLowerCase().indexOf('<iframe') === 0) {
          const regex = /<iframe[^>]*src="([^"]*)"/i;
          const match = regex.exec(originalValue);
          if (match) {
            urlPart = match[1]; // Contains the matched src, [0] contains the string where the match was found
          }
        }

        const config = JSON.parse(sessionStorage.getItem('searchguard') || '{}');
        const currentTenant = get(config, 'authinfo.user_requested_tenant');
        console.debug('addTenantToShareURL, currentTenant', currentTenant);

        const newValue = addTenantToURL(
          urlPart,
          originalValue,
          tenantNameToUiTenantName(currentTenant)
        );

        if (newValue !== originalValue) {
          target.textContent = newValue;
        }
      } catch (error) {
        // Probably wasn't an url, so we just ignore this
      }
    }
  });
}

/**
 * Add the tenant the value. The originalValue may include more than just an URL, e.g. for iFrame embeds.
 * @param url - The url we will append the tenant to
 * @param originalValue - In the case of iFrame embeds, we can't just replace the url itself
 * @returns {*}
 */
function addTenantToURL(url, originalValue = null, userRequestedTenant) {
  const tenantKey = 'sg_tenant';
  const tenantKeyAndValue = tenantKey + '=' + encodeURIComponent(userRequestedTenant);

  if (!originalValue) {
    originalValue = url;
  }

  let { host, pathname, search } = parse(url);
  const queryDelimiter = !search ? '?' : '&';

  // The url parser returns null if the search is empty. Change that to an empty
  // string so that we can use it to build the values later
  if (search === null) {
    search = '';
  } else if (search.toLowerCase().indexOf(tenantKey) > -1) {
    // If we for some reason already have a tenant in the URL we skip any updates
    return originalValue;
  }

  // A helper for finding the part in the string that we want to extend/replace
  const valueToReplace = host + pathname + search;
  const replaceWith = valueToReplace + queryDelimiter + tenantKeyAndValue;

  return originalValue.replace(valueToReplace, replaceWith);
}
