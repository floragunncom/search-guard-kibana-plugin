import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcFormNewResourceField', function () {
    return {
        template: require('./form_newresourcefield.html'),
        replace: true,
        restrict: 'E'
    };
});
