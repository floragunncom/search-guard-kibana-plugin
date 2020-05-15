/* eslint-disable @kbn/eslint/require-license-header */
import { isEmpty, forEach, startCase } from 'lodash';
import { sideNavItem } from '../../../utils/helpers';
import { SIDE_NAV } from './constants';
import { authenticationText, authorizationText } from '../../../utils/i18n/auth';

const AUTHC = 'authc';

export function getSideNavItems({ resources, onSelectSideNavItem, selectedSideNavItemName }) {
  const sideNavItems = [];
  if (isEmpty(resources)) return sideNavItems;

  const authcItems = [];
  const authzItems = [];

  let authcOrder = 0;
  let authzOrder = 0;

  // We must calculate the order if the ES plugin doesn't provide it
  function calcOrder(order, resourceType) {
    if (order) return order;
    if (resourceType === AUTHC) {
      return authcOrder++;
    }
    return authzOrder++;
  }

  forEach(resources, ({ name, order, resourceType }) => {
    const isCategory = name === SIDE_NAV.AUTHORIZATION || name === SIDE_NAV.AUTHENTICATION;
    const isActive = selectedSideNavItemName === name;
    const navItem = sideNavItem({
      id: name,
      text: startCase(name),
      navData: {
        order: calcOrder(order),
      },
      isCategory,
      isActive,
      onClick: () => onSelectSideNavItem(name),
    });

    if (resourceType === AUTHC) {
      authcItems.push(navItem);
    } else {
      authzItems.push(navItem);
    }
  });

  sideNavItems.push(
    sideNavItem({
      id: SIDE_NAV.AUTHENTICATION,
      text: authenticationText,
      navData: {
        items: authcItems.sort((a, b) => a.order - b.order),
      },
      isCategory: true,
    })
  );

  sideNavItems.push(
    sideNavItem({
      id: SIDE_NAV.AUTHORIZATION,
      text: authorizationText,
      navData: {
        items: authzItems.sort((a, b) => a.order - b.order),
      },
      isCategory: true,
    })
  );

  return sideNavItems;
}
