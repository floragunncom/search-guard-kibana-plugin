import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './views/index.html';
import editTemplate from './views/edit.html';

import '../../base_controller';
import './controller';
import '../../directives/directives';

import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/system', {
      template: sectionTemplate
    })
    .when('/system/license/new', {
        template: editTemplate
    });
