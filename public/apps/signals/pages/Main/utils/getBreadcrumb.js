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

export default function getBreadcrumb(route) {
  const removePrefixSlash = path => path.slice(1);

  const [ base, queryParams ] = route.split('?');
  if (!base) return null;

  const { id, accountType } = queryString.parse(queryParams);
  let urlParams = id ? `?id=${id}` : '';
  if (id && accountType) urlParams += `&accountType=${accountType}`;

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
