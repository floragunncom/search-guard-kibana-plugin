import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './index.html';
import editTemplate from './edit.html';
import './controller';
import '../../directives/configuration_directives';

import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/internalusers', {
        template: sectionTemplate
    })
    .when('/internalusers/edit/:resourcename', {
        template: editTemplate
    })
    .when('/internalusers/clone/:resourcename', {
        template: editTemplate
    })
    .when('/internalusers/new', {
        template: editTemplate
    });
