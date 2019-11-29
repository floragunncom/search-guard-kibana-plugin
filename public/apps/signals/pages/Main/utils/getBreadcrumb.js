import queryString from 'query-string';
import {
  createWatchText,
  updateWatchText,
  watchesText
} from '../../../utils/i18n/watch';
import {
  createAccountText,
  updateAccountText,
  accountsText
} from '../../../utils/i18n/account';
import { dashboardText } from '../../../utils/i18n/dashboard';
import { APP_PATH } from '../../../utils/constants';

// TODO: unit test this
export default function getBreadcrumb(route) {
  const removePrefixSlash = path => path.slice(1);

  const [ base, queryParams ] = route.split('?');
  if (!base) return null;

  const { id, watchId, accountType } = queryString.parse(queryParams);
  let urlParams = '';
  if (id && accountType) {
    urlParams = `?${queryString.stringify({ id, accountType })}`;
  } else if (id) {
    urlParams = `?${queryString.stringify({ id })}`;
  } else if (watchId) { // Alerts (execution history) by watch id
    urlParams = `?${queryString.stringify({ watchId })}`;
  }

  let alertsBreadcrumbs = [];

  if (watchId) {
    alertsBreadcrumbs = [
      ...alertsBreadcrumbs,
      {
        text: watchId,
        href: APP_PATH.ALERTS + urlParams
      }
    ];
  }

  const breadcrumb = {
    '#': { text: dashboardText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.DASHBOARD)]: alertsBreadcrumbs,
    [removePrefixSlash(APP_PATH.ALERTS)]: alertsBreadcrumbs,
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
    [removePrefixSlash(APP_PATH.ACCOUNTS)]: {
      text: accountsText,
      href: APP_PATH.ACCOUNTS
    },
    [removePrefixSlash(APP_PATH.DEFINE_ACCOUNT)]: [
      { text: accountsText, href: APP_PATH.ACCOUNTS },
      {
        text: id ? updateAccountText : createAccountText,
        href: APP_PATH.DEFINE_ACCOUNT + urlParams
      }
    ],
  }[base];

  return breadcrumb;
}
