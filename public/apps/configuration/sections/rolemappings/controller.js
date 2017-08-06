import uiModules from 'ui/modules';
import { get, merge, each  } from 'lodash';
import flatten from '../flatten';
const app = uiModules.get('apps/kibi_access_control/configuration', []);

app
.controller('kacRoleMappingsController', function ($scope, $element, $route, createNotifier, backendRoleMappings, kbnUrl) {

  $scope.notify = createNotifier({
    location: 'Role mappings'
  });

  $scope.service = backendRoleMappings;
  $scope.rolemapping = $route.current.locals.rolemapping;
  $scope.isNew = !Boolean($scope.rolemapping);
  $scope.roles = $route.current.locals.roles;

  $scope.internalUsers = {
    available: $route.current.locals.internalUsers.map((user) => merge(user, {
      icon: `<i class="fa ${user.icon}"></i>`
    })),
    selected: []
  };
  $scope.backendroles = [];
  $scope.hosts = [];

  if (!$scope.isNew) {
    const users = get($scope.rolemapping, 'users', []);
    for (let user of $scope.internalUsers.available) {
      if (users.indexOf(user.id) >= 0) {
        user.selected = true;
      }
    }
    const backendroles = get($scope.rolemapping, 'backendroles', []);
    $scope.backendroles = backendroles.map((backendrole) => ({ text: backendrole }));

    const hosts = get($scope.rolemapping, 'hosts', []);
    $scope.hosts = hosts.map((host) => ({ text: host }));
  }

  $scope.showObjectFinder = false;
  $scope.errorMessage = null;

  $scope.openObjectFinder = () => {
    $scope.showObjectFinder = true;
  };

  $scope.makeFinderUrl = (hit) => kbnUrl.eval(`#/authentication/rolemappings/${hit.id}`);

  $scope.editObject = () => {
    kbnUrl.change('/authentication/rolemappings');
  };

  $scope.deleteObject = () => {
    if ($scope.isNew) {
      return;
    }
    if ($scope.rolemapping && $scope.rolemapping.id) {
      if (confirm(`Are you sure you want to delete role mapping ${$scope.rolemapping.id}?`)) {
        $scope.service.delete($scope.rolemapping.id)
        .then(() => kbnUrl.change('/authentication/rolemappings'));
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

    $scope.errorMessage = null;

    $scope.rolemapping.users = $scope.internalUsers.selected.map((user) => {
      return user.id;
    });
    $scope.rolemapping.hosts = flatten($scope.hosts, 'text');
    $scope.rolemapping.backendroles = flatten($scope.backendroles, 'text');

    if ($scope.isNew) {
      $scope.service.create($scope.rolemapping)
      .then(() => kbnUrl.change(`/authentication/rolemappings/${$scope.rolemapping.id}`));
    } else {
      $scope.service.update($scope.rolemapping.id, {
        users: $scope.rolemapping.users,
        hosts: $scope.rolemapping.hosts,
        backendroles: $scope.rolemapping.backendroles
      })
      .then(() => kbnUrl.change(`/authentication/rolemappings/${$scope.rolemapping.id}`));
    }
  };

});
