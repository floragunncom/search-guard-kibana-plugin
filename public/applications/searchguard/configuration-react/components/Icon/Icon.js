/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { isObject } from 'lodash';
import * as icons from './assets';
import { Context } from '../../Context';

const sizes = {
  m: { width: '18px', height: '18px' },
  l: { width: '24px', height: '24px' },
  xl: { width: '36px', height: '36px' },
  xxl: { width: '48px', height: '48px' },
};

const Icon = ({ type, size = 'xl' }) => {
  const { configService } = useContext(Context);

  const _size = isObject(size) ? size : sizes[size];
  const _type = configService.get('is_dark_mode') ? type + '_dark' : type;
  const Svg = icons[_type] || icons.empty;
  return <Svg {..._size} />;
};

Icon.propTypes = {
  type: PropTypes.oneOf([
    'logo',
    'tenants',
    'tenantPattern',
    'systemStatus',
    'roleMappings',
    'purgeCache',
    'internalUsersDatabase',
    'indexPattern',
    'authcAndAuthz',
    'actionGroups',
    'roles',
  ]).isRequired,
  size: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      height: PropTypes.string.isRequired,
      width: PropTypes.string.isRequired,
    }),
  ]),
};

export default Icon;
