import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcErrorMessage', function () {
    return {
        template: require('./errormessage.html'),
        replace: true,
        restrict: 'E'
    };
});
