import angular from 'angular';
import uiRoutes from 'ui/routes';
import sectionTemplate from './index.html';
import './controller';

uiRoutes
.when('/authentication/rolemappings', {
  template: sectionTemplate,
  resolve: {
    internalUsers: ($route, kbnUrl, backendInternalUsers) => {
      return backendInternalUsers.find();
    },
    roles: ($route, kbnUrl, backendRoles) => {
      return backendRoles.find();
    }
  }
})
.when('/authentication/rolemappings/:id', {
  template: sectionTemplate,
  resolve: {
    internalUsers: ($route, kbnUrl, backendInternalUsers) => {
      return backendInternalUsers.find();
    },
    roles: ($route, kbnUrl, backendRoles) => {
      return backendRoles.find();
    },
    rolemapping: ($route, kbnUrl, backendRoleMappings) => {
      return backendRoleMappings.get($route.current.params.id);
    }
  }
});

export default (kbnUrl) => ({
  key: 'rolemappings',
  description: 'Role mappings',
  run: (event) => {
    event.preventDefault();
    kbnUrl.change('/authentication/rolemappings');
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
