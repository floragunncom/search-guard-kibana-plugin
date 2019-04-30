import { uiModules } from 'ui/modules';
import template from './accordeon.html';
import './accordeon_header';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('accordeon', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: template,
    scope: {
      accordeonId: '@',
      title: '@',
      testid: '@',
      isCollapsed: '=',
      additionalClass: '@'
    },
    controllerAs: 'accordeon',
    bindToController: true,
    controller: class AccordeonController {
      toggle = () => {
        this.isCollapsed = !this.isCollapsed;
        //this.onToggle(this.togglePanelId);
      };
    }
  };
});
