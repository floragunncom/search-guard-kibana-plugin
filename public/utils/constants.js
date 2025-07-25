/* eslint-disable @kbn/eslint/require-license-header */
import sgLogo from '../assets/searchguard_logo_left_navbar.svg';
import sgLogoDark from '../assets/searchguard_logo_left_navbar_dark.svg';


export const PLUGIN_NAME = 'searchguard';
export const API_ROOT = '/api/v1';

/**
 *
 * @param configService
 * @returns {{id: string, label: string, euiIconType: {}, order: number}}
 */
export const getSearchGuardAppCategory = (configService) => {
  const isDarkMode = (configService && configService.get('is_dark_mode')) ? true : false;
  return {
    id: 'searchguard-configuration-cat',
    label: 'Search Guard',
    euiIconType: isDarkMode ? sgLogoDark: sgLogo,
    order: 9010,
  }
}
