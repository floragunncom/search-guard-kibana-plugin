import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcListHeader', function () {
    return {
        template: require('./list_header.html'),
        replace: true,
        restrict: 'E'
    };
});
