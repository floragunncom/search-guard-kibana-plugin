import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './index.html';
import editTemplate from './edit.html';
import './controller';
import '../../directives/directives';

import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/rolemappings', {
      template: sectionTemplate
    })
    .when('/rolemappings/edit/:resourcename', {
      template: editTemplate
    })
    .when('/rolemappings/clone/:resourcename', {
        template: editTemplate
    })
    .when('/rolemappings/new', {
      template: editTemplate
    });
