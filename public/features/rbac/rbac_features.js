import {
  permissionAllLabelText,
  permissionNoneLabelText,
  permissionReadLabelText
} from "../../apps/configuration-react/utils/i18n/rbac";

export const readWriteActionGroupName = "SGS_KIBANA_ALL_WRITE";
export const readOnlyActionGroupName = "SGS_KIBANA_ALL_READ";

export const PATTERN_ACCESS_LEVELS = {
  READ_WRITE: 'ReadWrite',
  READ_ONLY: 'Read',
  RBAC: 'RBAC'
};


function roleHasReadWrite(roleActionGroups) {
  return roleActionGroups.indexOf(readWriteActionGroupName) > -1;
}

function roleHasReadOnlyActionGroup(roleActionGroups) {
  return roleActionGroups.indexOf(readOnlyActionGroupName) > -1;
}

function roleHasRBACActionGroups(roleActionGroups) {
  let rbacActionGroups = roleActionGroups.filter(actionGroup => [readWriteActionGroupName, readOnlyActionGroupName].indexOf(actionGroup) === -1);
  return (rbacActionGroups.length === 0) ? false : true;
}

export function getPatternAccessLevel(roleActionGroups) {
  if (roleHasRBACActionGroups(roleActionGroups)) {
    return PATTERN_ACCESS_LEVELS.RBAC;
  } else if (roleHasReadWrite(roleActionGroups)) {
    return PATTERN_ACCESS_LEVELS.READ_WRITE;
  } else {
    return PATTERN_ACCESS_LEVELS.READ_ONLY
  }
}

/**
 * Group the original Kibana action groups
 * into features with either All or Read
 * options, or a switch for action groups
 * that don't have have All and Read
 * @param originalActionGroups
 * @param roleActionGroups
 */
export function getFeaturesMap(originalActionGroups, roleActionGroups) {

  // Filter out non Kibana action groups, as well as the
  // WRITE_ALL and READ_ALL action groups
  const actionGroups = Object.keys(originalActionGroups)
    .sort()
    .filter((actionGroupName) => {
      const actionGroup = originalActionGroups[actionGroupName];

      if (!actionGroup.type || actionGroup.type.toLowerCase() !== 'kibana') {
        return false;
      }

      if ([readWriteActionGroupName, readOnlyActionGroupName].indexOf(actionGroupName) !== -1) {
        return false;
      }

      return true;
    })
    ;

  let featuresMap = {};
  actionGroups.forEach(actionGroup => {
    const actionGroupParts = actionGroup.split("_");
    const actionGroupPermissionLevel = actionGroupParts[
    actionGroupParts.length - 1
      ].toLowerCase();
    let permission = null;
    let featureName = null;

    if (["all", "read"].indexOf(actionGroupPermissionLevel.toLowerCase()) > -1) {
      permission = {
        label: actionGroupParts.pop(),
        actionGroup: actionGroup,
        // Does ranking all/read make sense? Useful later?
        // Maybe just use "type"
        permissionLevel: actionGroupPermissionLevel,
        rank: actionGroupPermissionLevel === "all" ? 1 : 2
      };
    } else {
      permission = {
        label: actionGroupParts.join(" "),
        actionGroup,
        rank: 1,
        permissionLevel: null
      };
    }

    // Rebuild the name without the permissions part
    featureName = actionGroupParts.length
      ? actionGroupParts.join(" ")
      : actionGroup;

    // Start building the map with permissions and selected info for each feature
    // In theory, a user can have both ALL und READ for a given feature, so we
    // need to figure out what to show as active in that case.
    let feature = featuresMap[featureName] || {
      permissions: [],
      selected: null
    };

    feature.permissions.push(permission);

    featuresMap[featureName] = feature;
  });

  // Handle selected state
  Object.keys(featuresMap).forEach(featureId => {
    let feature = featuresMap[featureId];
    feature.permissions
      // Sort by rank in case a user has both read and write permissions
      .sort((a, b) => (a.rank > b.rank ? -1 : 1))
      .forEach(permission => {
        if (
          roleActionGroups.indexOf(permission.actionGroup) > -1 ||
          roleHasReadWrite(roleActionGroups)
        ) {
          feature.selected = permission.actionGroup;
        } else if (
          permission.permissionLevel === "read" &&
          roleHasReadOnlyActionGroup(roleActionGroups)
        ) {
          feature.selected = permission.actionGroup;
        }
      });
  });

  return featuresMap;
}


/**
 * Transform the feature map into a format that
 * we can use to display the feature table
 * @param featuresMap
 * @returns {Array}
 */
export function transformFeatureMapForUI(featuresMap) {

  let featureItems = [];

  // Builds object for the UI
  Object.keys(featuresMap).forEach(featureId => {
    const featureFromMap = featuresMap[featureId];
    let feature = {
      id: featureId,
      selected: featureFromMap.selected,
      options: featureFromMap.permissions
        .sort((a, b) => (a.rank < b.rank ? -1 : 1))
        .map(feature => {
          let label = feature.label.charAt(0).toUpperCase() +
            feature.label.substring(1).toLowerCase();

          // If we have All vs Read
          /* Using a EuiI18N throws an error in the button group?
          if (label === 'All') {
            label = permissionAllLabelText
          } else if (label === 'Read') {
            label = permissionReadLabelText
          }

           */
          return {
            id: feature.actionGroup,
            label: label
          };
        })
    };

    // Add a "None" option for the features with both Read and Write
    if (feature.options.length > 1) {
      feature.options.push({
        id: "_none",
        label: "None", // permissionNoneLabelText
      });

      if (!feature.selected) {
        feature.selected = "_none";
      }
    }

    featureItems.push(feature);
  });

  return featureItems;
}

/**
 * Transform the UI values into an array of action groups
 * @param features
 * @returns {*[]}
 */
export function serializeFeaturesIntoActionGroups(features) {
  const actionGroups = Object.values(features)
    .filter(feature => feature.selected && feature.selected !== '_none')
    .map(feature => feature.selected)
    ;

  return actionGroups;
}

