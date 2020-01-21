import queryString from 'query-string';
import {
  createWatchText,
  updateWatchText,
  watchesText,
  executionHistoryText
} from '../../../utils/i18n/watch';
import {
  createAccountText,
  updateAccountText,
  accountsText
} from '../../../utils/i18n/account';
import { homeText } from '../../../utils/i18n/common';
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

  const breadcrumb = {
    '#': { text: homeText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.ALERTS)]: [
      {
        text: watchesText,
        href: APP_PATH.WATCHES
      },
      {
        text: executionHistoryText,
        href: APP_PATH.ALERTS + urlParams
      }
    ],
    [removePrefixSlash(APP_PATH.WATCHES)]: {
      text: watchesText,
      href: APP_PATH.WATCHES
    },
    [removePrefixSlash(APP_PATH.DEFINE_WATCH)]: [
      {
        text: watchesText,
        href: APP_PATH.WATCHES
      },
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
      {
        text: accountsText,
        href: APP_PATH.ACCOUNTS
      },
      {
        text: id ? updateAccountText : createAccountText,
        href: APP_PATH.DEFINE_ACCOUNT + urlParams
      }
    ],
  }[base];

  return breadcrumb;
}
