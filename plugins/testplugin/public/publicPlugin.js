/* eslint-disable @kbn/eslint/require-license-header */
import {parse} from "url";
import React from 'react';
import ReactDOM from 'react-dom';
import { addTenantToShareURL } from "../helpers/multitenancy";
import { redirectOnSessionTimeout } from "../helpers/redirectOnSessionTimeout";

export class PublicPlugin {

  /*
  ATTENTION! Kibana imposes restrictions to the plugin lifecycle methods:
  1. A method must not return promise.
  2. A method execution time limit is 10 seconds.
  */
  setup(coreSetup) {
    const sgDynamicConfig = coreSetup.injectedMetadata.getInjectedVar('sgDynamic');
    const authConfig = coreSetup.injectedMetadata.getInjectedVar('auth');
    if (sgDynamicConfig) {
      addTenantToShareURL(sgDynamicConfig);
    }

    if (authConfig) {
      const isAnonymousAuth = (authConfig.type === 'basicauth' && sgDynamicConfig && sgDynamicConfig.user && sgDynamicConfig.user.isAnonymousAuth);
      redirectOnSessionTimeout(
        authConfig.type,
        coreSetup.http,
        isAnonymousAuth
      );
    }
  }

  start(core) {

  }


}
