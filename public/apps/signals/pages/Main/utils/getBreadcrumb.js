import queryString from 'query-string';
import {
  createWatchText,
  updateWatchText,
  watchesText
} from '../../../utils/i18n/watch';
import {
  createDestinationText,
  updateDestinationText,
  destinationsText
} from '../../../utils/i18n/destination';
import { dashboardText } from '../../../utils/i18n/dashboard';
import { APP_PATH } from '../../../utils/constants';

export default function getBreadcrumb(route) {
  const removePrefixSlash = path => path.slice(1);

  const [ base, queryParams ] = route.split('?');
  if (!base) return null;

  const { id, type } = queryString.parse(queryParams);
  let urlParams = id ? `?id=${id}` : '';
  if (id && type) urlParams += `&type=${type}`;

  const breadcrumb = {
    '#': { text: dashboardText, href: APP_PATH.DASHBOARD },
    [removePrefixSlash(APP_PATH.WATCHES)]: {
      text: watchesText,
      href: APP_PATH.WATCHES
    },
    [removePrefixSlash(APP_PATH.DEFINE_WATCH)]: [
      { text: watchesText, href: APP_PATH.WATCHES },
      {
        text: id ? updateWatchText : createWatchText,
        href: APP_PATH.DEFINE_WATCH + urlParams
      }
    ],
    [removePrefixSlash(APP_PATH.DESTINATIONS)]: {
      text: destinationsText,
      href: APP_PATH.DESTINATIONS
    },
    [removePrefixSlash(APP_PATH.DEFINE_DESTINATION)]: [
      { text: destinationsText, href: APP_PATH.DESTINATIONS },
      {
        text: id ? updateDestinationText : createDestinationText,
        href: APP_PATH.DEFINE_DESTINATION + urlParams
      }
    ],
  }[base];

  return breadcrumb;
}
