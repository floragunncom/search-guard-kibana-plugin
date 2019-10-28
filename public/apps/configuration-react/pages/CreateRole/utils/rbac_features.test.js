import _ from "lodash";

import {
  getActionGroupsBasedOnPatternAccessLevel,
  getFeaturesMap,
  getPatternAccessLevel, PATTERN_ACCESS_LEVELS,
  READ_ONLY_ACTION_GROUP_NAME,
  READ_WRITE_ACTION_GROUP_NAME, serializeFeaturesIntoActionGroups, transformFeatureMapForUI
} from "./rbac_features";

describe('RBAC UI ', () => {

  const kibanaActionGroups = {
    "RBAC_FEATURE1_READ": {
      "type": "kibana",
    },
    "SGS_KIBANA_ALL_READ": {
      "type": "kibana",
    },
    /*
    "SGS_UNLIMITED": {
      "reserved": true,
      "hidden": false,
      "allowed_actions": [
        "*"
      ],
      "type": "all",
      "description": "Allow all",
      "static": true
    },
    */

    "RBAC_FEATURE2_ALL": {
      "type": "kibana",
    },

    "RBAC_FEATURE2_READ": {
      "type": "kibana",
    },


    "SGS_KIBANA_ALL_WRITE": {
      "type": "kibana",
    },

    "RBAC_FEATURE1_ALL": {
      "type": "kibana",
    },
    "RBAC_SINGLE_FEATURE": {
      "type": "kibana",
    },
  };

  const featuresMap = {
    "RBAC FEATURE1": {
      "permissions": [
        {
          "label": "READ",
          "actionGroup": "RBAC_FEATURE1_READ",
          "permissionLevel": "read",
          "rank": 2
        },
        {
          "label": "ALL",
          "actionGroup": "RBAC_FEATURE1_ALL",
          "permissionLevel": "all",
          "rank": 1
        }
      ],
      "selected": "RBAC_FEATURE1_ALL"
    },
    "RBAC FEATURE2": {
      "permissions": [
        {
          "label": "READ",
          "actionGroup": "RBAC_FEATURE2_READ",
          "permissionLevel": "read",
          "rank": 2
        },
        {
          "label": "ALL",
          "actionGroup": "RBAC_FEATURE2_ALL",
          "permissionLevel": "all",
          "rank": 1
        }
      ],
      "selected": "RBAC_FEATURE2_READ"
    },
    "RBAC SINGLE FEATURE": {
      "permissions": [
        {
          "label": "RBAC SINGLE FEATURE",
          "actionGroup": "RBAC_SINGLE_FEATURE",
          "rank": 1,
          "permissionLevel": null
        }
      ],
      "selected": "RBAC_SINGLE_FEATURE"
    }
  };

  const validUI = [
    {
      "id": "RBAC FEATURE1",
      "selected": "RBAC_FEATURE1_ALL",
      "options": [
        {
          "id": "RBAC_FEATURE1_ALL",
          "label": "All"
        },
        {
          "id": "RBAC_FEATURE1_READ",
          "label": "Read"
        },
        {
          "id": "_none",
          "label": "None"
        }
      ]
    },
    {
      "id": "RBAC FEATURE2",
      "selected": "RBAC_FEATURE2_READ",
      "options": [
        {
          "id": "RBAC_FEATURE2_ALL",
          "label": "All"
        },
        {
          "id": "RBAC_FEATURE2_READ",
          "label": "Read"
        },
        {
          "id": "_none",
          "label": "None"
        }
      ]
    },
    {
      "id": "RBAC SINGLE FEATURE",
      "selected": "RBAC_SINGLE_FEATURE",
      "options": [
        {
          "id": "RBAC_SINGLE_FEATURE",
          "label": "Rbac single feature"
        }
      ]
    }
  ];



  // BUILD FEATURES MAP

  test('can build RBAC features from original Kibana action groups', () => {

    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ', 'RBAC_SINGLE_FEATURE'];

    expect(getFeaturesMap(kibanaActionGroups, roleActionGroups)).toEqual(featuresMap);
  });

  test('RBAC feature selected item is set properly based on existing action groups', () => {
    let localFeaturesMap = _.cloneDeep(featuresMap);

    localFeaturesMap["RBAC SINGLE FEATURE"].selected = null;
    localFeaturesMap["RBAC FEATURE2"].selected = null;

    const roleActionGroups = ['RBAC_FEATURE1_ALL'];
    expect(getFeaturesMap(kibanaActionGroups, roleActionGroups)).toEqual(localFeaturesMap);
  });

  test('does not include Global ReadWrite or Read as feature', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ'];
    const featuresMap = getFeaturesMap(kibanaActionGroups, roleActionGroups);

    let foundActionGroupAsFeature = false;
    [READ_WRITE_ACTION_GROUP_NAME, READ_ONLY_ACTION_GROUP_NAME].forEach(actionGroupName => {
      if (featuresMap[actionGroupName]) {
        foundActionGroupAsFeature = true;
      }
    })

    expect(foundActionGroupAsFeature).toBe(false);
  });

  test('does only include action groups with type Kibana', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ'];
    const actionGroups = {
      ...kibanaActionGroups,
      SGS_OTHER: {
        type: "index",
      },

    };

    const featuresMap = getFeaturesMap(actionGroups, roleActionGroups);

    let foundActionGroupAsFeature = false;
    ['SGS_OTHER'].forEach(actionGroupName => {
      if (featuresMap[actionGroupName]) {
        foundActionGroupAsFeature = true;
      }
    })

    expect(foundActionGroupAsFeature).toBe(false);
  });

  test('does not include Global ReadWrite or Read as feature', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ'];
    const featuresMap = getFeaturesMap(kibanaActionGroups, roleActionGroups);

    let foundActionGroupAsFeature = false;
    [READ_WRITE_ACTION_GROUP_NAME, READ_ONLY_ACTION_GROUP_NAME].forEach(actionGroupName => {
      if (featuresMap[actionGroupName]) {
        foundActionGroupAsFeature = true;
      }
    })

    expect(foundActionGroupAsFeature).toBe(false);
  });

  // PATTERN ACCESS LEVEL

  test('does detect pattern access level: global read & write', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ', READ_WRITE_ACTION_GROUP_NAME, READ_ONLY_ACTION_GROUP_NAME];
    const patternAccessLevel = getPatternAccessLevel(roleActionGroups);

    expect(patternAccessLevel).toBe(PATTERN_ACCESS_LEVELS.READ_WRITE);
  });

  test('does detect pattern access level: global read only', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ', READ_ONLY_ACTION_GROUP_NAME];
    const patternAccessLevel = getPatternAccessLevel(roleActionGroups);

    expect(patternAccessLevel).toBe(PATTERN_ACCESS_LEVELS.READ_ONLY);
  });

  test('does detect pattern access level: RBAC', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ'];
    const patternAccessLevel = getPatternAccessLevel(roleActionGroups);

    expect(patternAccessLevel).toBe(PATTERN_ACCESS_LEVELS.RBAC);
  });

  // TRANSFORM TO UI

  test('featuresMap is transformed into an object readable by the EuiButtonGroup', () => {
    expect(transformFeatureMapForUI(featuresMap)).toEqual(validUI);
  });

  // SERIALIZE TO ACTION GROUPS
  test('features UI items are transformed into action groups', () => {
    const roleActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ', 'RBAC_SINGLE_FEATURE'];
    expect(serializeFeaturesIntoActionGroups(validUI)).toEqual(roleActionGroups);
  });

  test('action groups are serialized based on pattern access level RBAC', () => {
    const expectedActionGroups = ['RBAC_FEATURE1_ALL', 'RBAC_FEATURE2_READ', 'RBAC_SINGLE_FEATURE'];
    expect(getActionGroupsBasedOnPatternAccessLevel(PATTERN_ACCESS_LEVELS.RBAC, validUI)).toEqual(expectedActionGroups);
  });

  test('action groups are serialized based on pattern access level READ WRITE', () => {
    const expectedActionGroups = [READ_WRITE_ACTION_GROUP_NAME];
    expect(getActionGroupsBasedOnPatternAccessLevel(PATTERN_ACCESS_LEVELS.READ_WRITE, validUI)).toEqual(expectedActionGroups);
  });

  test('action groups are serialized based on pattern access level READ ONLY', () => {
    const expectedActionGroups = [READ_ONLY_ACTION_GROUP_NAME];
    expect(getActionGroupsBasedOnPatternAccessLevel(PATTERN_ACCESS_LEVELS.READ_ONLY, validUI)).toEqual(expectedActionGroups);
  });

});
