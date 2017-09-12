import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcHeader', function () {
    return {
        template: require('./header.html'),
        replace: true,
        restrict: 'E'
    };
});
