import {parse} from "url";

export function addTenantToShareURL(sgDynamic) {

  // Add tenant info to the request
  if (sgDynamic && sgDynamic.multiTenancy) {
    // Add the tenant to URLs copied from the share panel
    document.addEventListener('copy', (event) => {
      const shareButton = document.querySelector('[data-share-url]');
      const target = document.querySelector('body > span');
      // The copy event listens to Cmd + C too, so we need to make sure
      // that we're actually copied something via the share panel
      if (shareButton && target && shareButton.getAttribute('data-share-url') == target.textContent) {
        let originalValue = target.textContent;
        let urlPart = originalValue;

        // We need to figure out where in the value to add the tenant.
        // Since Kibana sometimes adds values that aren't in the current location/url,
        // we need to use the actual input values to do a sanity check.
        try {

          // For the iFrame urls we need to parse out the src
          if (originalValue.toLowerCase().indexOf('<iframe') === 0) {
            const regex = /<iframe[^>]*src="([^"]*)"/i;
            let match = regex.exec(originalValue);
            if (match) {
              urlPart = match[1]; // Contains the matched src, [0] contains the string where the match was found
            }
          }

          let newValue = addTenantToURL(urlPart, originalValue, sgDynamic.multiTenancy.currentTenantName);

          if (newValue !== originalValue) {
            target.textContent = newValue;
          }
        } catch (error) {
          // Probably wasn't an url, so we just ignore this
        }
      }
    });
  }
}

function addTenantToURL(url, originalValue = null, userRequestedTenant) {
  const tenantKey = 'sg_tenant';
  const tenantKeyAndValue = tenantKey + '=' + encodeURIComponent(userRequestedTenant);

  if (! originalValue) {
    originalValue = url;
  }

  let {host, pathname, search} = parse(url);
  let queryDelimiter = (!search) ? '?' : '&';

  // The url parser returns null if the search is empty. Change that to an empty
  // string so that we can use it to build the values later
  if (search === null) {
    search = '';
  } else if (search.toLowerCase().indexOf(tenantKey) > - 1) {
    // If we for some reason already have a tenant in the URL we skip any updates
    return originalValue;
  }

  // A helper for finding the part in the string that we want to extend/replace
  let valueToReplace = host + pathname + search;
  let replaceWith = valueToReplace + queryDelimiter + tenantKeyAndValue;

  return originalValue.replace(valueToReplace, replaceWith);
}