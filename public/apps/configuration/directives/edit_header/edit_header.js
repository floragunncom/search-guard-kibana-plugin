import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcEditHeader', function () {
    return {
        template: require('./edit_header.html'),
        replace: true,
        restrict: 'E'
    };
});
