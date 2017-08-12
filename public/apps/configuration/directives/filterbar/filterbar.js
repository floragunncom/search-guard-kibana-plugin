import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcFilterBar', function () {
        return {
            template: require('./filterbar.html'),
            replace: true,
            restrict: 'E'
        };
    });
