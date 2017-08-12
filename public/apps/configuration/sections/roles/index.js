import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './index.html';
import editTemplate from './edit.html';
import editIndexTemplate from './edit_index.html';
import './controller';
import '../../directives/directives';
import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/roles', {
      template: sectionTemplate
    })
    .when('/roles/edit/:resourcename', {
      template: editTemplate
    })
    .when('/roles/clone/:resourcename', {
        template: editTemplate
    })
    .when('/roles/new', {
      template: editTemplate
    })
    .when('/roles/editindex/:resourcename/:indexname', {
        template: editIndexTemplate
    });
