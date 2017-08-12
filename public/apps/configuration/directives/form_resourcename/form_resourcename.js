import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcFormResourceName', function () {
    return {
        template: require('./form_resourcename.html'),
        replace: true,
        restrict: 'E'
    };
});
