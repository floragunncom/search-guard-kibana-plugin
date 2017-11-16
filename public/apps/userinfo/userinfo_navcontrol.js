import { constant } from 'lodash';
import uiRoutes from 'ui/routes';
import { chromeNavControlsRegistry } from 'ui/registry/chrome_nav_controls';
import { uiModules } from 'ui/modules';
import navtemplate from 'plugins/searchguard/apps/userinfo/userinfo_navcontrol.html';
import infotemplate from 'plugins/searchguard/apps/userinfo/userinfo.html';
import 'ui/chrome/directives/global_nav/global_nav.js'
import 'plugins/searchguard/apps/configuration/directives/edit_header/edit_header.js'

chromeNavControlsRegistry.register(constant({
    name: 'searchguard',
    order: 10000,
    template: navtemplate
}));

uiRoutes
    .when('/userinfo', {
        template: infotemplate,
        controller: 'userinfoNavController'
    });

uiModules
    .get('app/searchguard-userinfo')
    .controller('userinfoNavController', ($scope, globalNavState, kbnBaseUrl, Private) => {

        $scope.title = function () {
            return "Account information";;
        }

        $scope.sg_user = {};

        $scope.init = function () {
            var cachedUser = sessionStorage.getItem("sg_user");
            if (cachedUser) {
                try {
                    $scope.sg_user = JSON.parse(cachedUser);
                } catch (err) {
                    $scope.sg_user = {
                        username: "Account Info"
                    };
                }
            }
        }

        $scope.init();

        $scope.route = `${kbnBaseUrl}#/userinfo`;


        $scope.tooltip = (name) => {
            return $scope.formatTooltip(name);
        };

        $scope.onClick = function (event, disabled) {
            if (disabled) {
                event.preventDefault();
            }
        };

        $scope.formatTooltip = (tooltip) => {
            if (globalNavState.isOpen()) {
                return;
            }
            return tooltip;
        };

        // helper function to use Object.keys in templates
        $scope.keys = function (object) {
            if (object) {
                return Object.keys(object).sort();
            }
        }

    })
    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                    //Also remove . and , so its gives a cleaner result.
                    if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                        lastspace = lastspace - 1;
                    }
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });

