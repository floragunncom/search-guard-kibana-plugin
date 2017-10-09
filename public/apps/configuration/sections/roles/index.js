import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './views/index.html';
import editRoleTemplate from './views/edit_role.html';

import '../../base_controller';
import './controller';
import '../../directives/directives';

import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/roles', {
      template: sectionTemplate
    })
    .when('/roles/new', {
        template: editRoleTemplate
    })
    .when('/roles/edit/:resourcename', {
      template: editRoleTemplate
    })
    .when('/roles/edit/:resourcename/:indexname', {
        template: editRoleTemplate
    })
