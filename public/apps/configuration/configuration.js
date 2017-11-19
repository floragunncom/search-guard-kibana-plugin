/**
 *    Copyright 2016 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import chrome from 'ui/chrome';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import { Notifier } from 'ui/notify/notifier';

import internalusers from './sections/internalusers';
import actiongroups from './sections/actiongroups';
import rolesmapping from './sections/rolesmapping';
import roles from './sections/roles';
import sgconfiguration from './sections/sgconfiguration';
import system from './sections/system';

import 'ui/autoload/styles';

import 'plugins/searchguard/apps/configuration/configuration.less';

import 'ace';

import searchguardConfigurationController from './configuration_controller';
import template from './configuration.html';

require('ui/tooltip');

uiRoutes.enable();

uiRoutes
    .when('/', {
        template: template
    });
