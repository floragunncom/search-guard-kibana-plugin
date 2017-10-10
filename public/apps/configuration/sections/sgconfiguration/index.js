import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './views/index.html';

import '../../base_controller';
import './controller';
import '../../directives/directives';

import 'ui/autoload/styles';
import 'plugins/searchguard/apps/configuration/configuration.less';

uiRoutes
    .when('/sgconfiguration', {
        template: sectionTemplate
    });
