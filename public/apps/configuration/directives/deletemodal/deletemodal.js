import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcDeleteModal', function () {
    return {
        template: require('./deletemodal.html'),
        restrict: 'E',
        scope: false
    };
});
