import uiModules from 'ui/modules';
import { get } from 'lodash';
import yaml from 'yaml-js';
const app = uiModules.get('apps/kibi_access_control/configuration', []);

app
.controller('kacRolesController', function ($scope, $element, $route, createNotifier, backendRoles, kbnUrl) {

  $scope.notify = createNotifier({
    location: 'Roles'
  });

  $scope.service = backendRoles;
  $scope.role = $route.current.locals.role;
  $scope.isNew = !Boolean($scope.role);
  $scope.permissions = {
    raw: ''
  };
  if ($scope.isNew) {
    $scope.permissions.raw = 'cluster:\n  - \'<permission>\'\nindices:\n  \'<index_or_alias>:\'\n    \'<type>:\'\n      - \'<permission>\'';
  } else {
    try {
      $scope.permissions.raw = yaml.safeDump($scope.role.permissions);
    } catch (error) {
      $scope.notify.error(error);
      return kbnUrl.change('/authentication/roles');
    }
  }

  $scope.aceLoaded = (editor) => {
    editor.session.setOptions({
      tabSize: 2,
      useSoftTabs: false
    });
    editor.setShowPrintMargin(false);
  };

  $scope.showObjectFinder = false;
  $scope.errorMessage = null;

  $scope.openObjectFinder = () => {
    $scope.showObjectFinder = true;
  };

  $scope.makeFinderUrl = (hit) => kbnUrl.eval(`#/authentication/roles/${hit.id}`);

  $scope.editObject = () => {
    kbnUrl.change('/authentication/roles');
  };

  $scope.deleteObject = () => {
    if ($scope.isNew) {
      return;
    }
    if ($scope.role && $scope.role.id) {
      if (confirm(`Are you sure you want to delete role ${$scope.role.id}?`)) {
        $scope.service.delete($scope.role.id)
        .then(() => kbnUrl.change('/authentication/roles'));
      }
    }
  };

  $scope.saveObject = (event) => {
    if (event) {
      event.preventDefault();
    }

    const form = $element.find('form[name="objectForm"]');

    if (form.hasClass('ng-invalid-required')) {
      $scope.errorMessage = 'Please fill in all the required parameters.';
      return;
    }

    if (!form.hasClass('ng-valid')) {
      $scope.errorMessage = 'Please correct all errors and try again.';
      return;
    }

    let permissions;
    try {
      permissions = yaml.safeLoad($scope.permissions.raw);
    } catch (error) {
      $scope.errorMessage = `An error occurred while parsing permissions: ${error}`;
      return;
    }

    $scope.errorMessage = null;

    if ($scope.isNew) {
      $scope.service.create({
        id: $scope.role.id,
        permissions: permissions
      })
      .then(() => kbnUrl.change(`/authentication/roles/${$scope.role.id}`));
    } else {
      $scope.service.update($scope.role.id, {permissions})
      .then(() => kbnUrl.change(`/authentication/roles/${$scope.role.id}`));
    }
  };

});
