import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './views/index.html';
import addRoleTemplate from './views/add_role.html';
import editRoleTemplate from './views/edit_role.html';
import editClusterPermissionsTemplate from './views/edit_cluster_permissions.html';
import editIndexPermissionsTemplate from './views/edit_index_permissions.html';
import editTenantsTemplate from './views/edit_tenants.html';
import addIndexTemplate from './views/add_index.html';

import editIndexTemplate from './views/edit_index.html';

import '../basecontroller';
import './controller';
import '../../directives/directives';

import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/roles', {
      template: sectionTemplate
    })
    .when('/roles/add', {
        template: addRoleTemplate
    })
    .when('/roles/edit/:resourcename', {
      template: editRoleTemplate
    })
    .when('/roles/edit/clusterpermissions/:resourcename', {
        template: editClusterPermissionsTemplate
    })
    .when('/roles/edit/indexpermissions/:resourcename', {
        template: editIndexPermissionsTemplate
    })
    .when('/roles/edit/tenants/:resourcename', {
        template: editTenantsTemplate
    })
    .when('/roles/index/add/:resourcename', {
        template: addIndexTemplate
    })

    .when('/roles/clone/:resourcename', {
        template: editRoleTemplate
    })
    .when('/roles/editindex/:resourcename/:indexname', {
        template: editIndexTemplate
    });
