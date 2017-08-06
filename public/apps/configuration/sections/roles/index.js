import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './index.html';
import './controller';

uiRoutes
.when('/authentication/roles', {
  template: sectionTemplate
})
.when('/authentication/roles/:id', {
  template: sectionTemplate,
  resolve: {
    role: ($route, kbnUrl, backendRoles) => {
      return backendRoles.get($route.current.params.id);
    }
  }
});

export default (kbnUrl) => ({
  key: 'roles',
  description: 'Roles',
  run: (event) => {
    event.preventDefault();
    kbnUrl.change('/authentication/roles');
  },
  openObjectFinder: () => {
    angular.element('#section-editor').scope().openObjectFinder();
  },
  editObject: () => {
    angular.element('#section-editor').scope().editObject();
  },
  saveObject: () => {
    angular.element('#object-form').scope().saveObject();
  },
  deleteObject: () => {
    angular.element('#section-editor').scope().deleteObject();
  }
});
