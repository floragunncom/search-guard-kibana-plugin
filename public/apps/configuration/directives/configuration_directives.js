import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('searchGuardConfigurationFilter', function () {
        return {
            template: require('./filterbar.html'),
            replace: true,
            restrict: 'E'
        };
    });

app.directive('searchGuardConfigurationListHeader', function () {
    return {
        template: require('./listheader.html'),
        replace: true,
        restrict: 'E'
    };
});

app.directive('searchGuardConfigurationEditHeader', function () {
    return {
        template: require('./editheader.html'),
        replace: true,
        restrict: 'E'
    };
});

app.directive('searchGuardConfigurationBackButton', function () {
    return {
        template: require('./backbutton.html'),
        replace: true,
        restrict: 'E'
    };
});
