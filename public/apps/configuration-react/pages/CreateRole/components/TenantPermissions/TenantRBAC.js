import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { EuiInMemoryTable, EuiButtonGroup, EuiSwitch, EuiText, EuiSpacer } from "@elastic/eui";

import {
  transformFeatureMapForUI,
  serializeFeaturesIntoActionGroups,
  getFeaturesMap,
  readWriteActionGroupName,
  readOnlyActionGroupName,
  PATTERN_ACCESS_LEVELS, getPatternAccessLevel
} from "../../../../../../features/rbac/rbac_features";
import {featureColText, permissionColText} from "../../../../utils/i18n/rbac";


const FeatureButtonGroup = props => {
  const onChangePermission = selectedValue => {
    props.onFeatureChange(props.feature.id, selectedValue);
  };

  const availableOptionsString = props.feature.options.map(option => option.id).join(',');

  return (
      <EuiButtonGroup
        data-test-subj={props.feature.id} data-test-options={availableOptionsString} data-test-selected={props.feature.selected}
        options={props.feature.options}
        idSelected={props.feature.selected}
        onChange={onChangePermission}
      />
  );
};


export class TenantRBAC extends Component {
  constructor(props) {
    super(props);

    const featuresMap = getFeaturesMap(this.props.actionGroups, this.props.roleActionGroups);
    const features = transformFeatureMapForUI(featuresMap);

    this.permissionLevelOptions = [
      {
        id: PATTERN_ACCESS_LEVELS.READ_WRITE,
        label: "Read & Write"
      },
      {
        id: PATTERN_ACCESS_LEVELS.READ_ONLY,
        label: "Read"
      },
      {
        id: PATTERN_ACCESS_LEVELS.RBAC,
        label: "RBAC"
      }
    ];

    this.state = {
      rbacEnabled: true,
      features,
      patternAccessLevel: getPatternAccessLevel(this.props.roleActionGroups),
      serializedActionGroups: serializeFeaturesIntoActionGroups(features)
    };

    this.updateParent();

    this.permissionColumns = [
      {
        field: "id",
        name: featureColText,
        render: (featureName) => {

          return (
            <EuiText data-test-subj={'sgTableCol-Feature-' + featureName}>
              {featureName}
            </EuiText>
          )
        }
      },
      {
        name: permissionColText,
        render: feature => (
          <div>
            {feature.options.length > 1 ? (
              <FeatureButtonGroup
                feature={feature}
                onFeatureChange={this.onFeatureChange}
              />
            ) : (
              <EuiSwitch
               label={''}
               data-test-subj={feature.id}
               data-test-selected={(feature.selected) ? true : false}
               checked={feature.selected}
               onChange={(event) => this.onSwitchChange(event, feature)}/>
            )}
          </div>
        )
      }
    ];

  }

  updateParent() {
    if (this.state.patternAccessLevel === PATTERN_ACCESS_LEVELS.RBAC) {
      const serializedActionGroups = serializeFeaturesIntoActionGroups([...this.state.features]);
      this.props.onPermissionsChange(serializedActionGroups);
    } else {
      const actionGroup = (this.state.patternAccessLevel === PATTERN_ACCESS_LEVELS.READ_WRITE)
        ? readWriteActionGroupName
        : readOnlyActionGroupName;

      this.props.onPermissionsChange([actionGroup]);
    }
  }

  onPatternAccessLevelChange = (value) => {
    this.setState({ patternAccessLevel: value }, this.updateParent);
  }


  onSwitchChange = (event, feature) => {
    let features = [...this.state.features];
    const featureId = feature.id;
    const featureIndex = features.findIndex(
      feature => feature.id === featureId
    );
    if (featureIndex > -1) {
      features[featureIndex].selected = (features[featureIndex].selected) ? null : feature.options[0].id;
    }

    this.setState({
      features
    });

    this.updateParent();

  }

  onFeatureChange = (featureId, value) => {
    let features = [...this.state.features];

    const featureIndex = features.findIndex(
      feature => feature.id === featureId
    );
    if (featureIndex > -1) {
      features[featureIndex].selected = value;
    }

    this.setState({
      features
    });

    this.updateParent();
  };

  render() {

    const availableOptionsString = this.permissionLevelOptions.map(option => option.id).join(',');

    const permissions = (
      <Fragment>
        <EuiButtonGroup
          data-test-subj={"sgRoleTenantPatterns-patternAccessLevel"}
          data-test-options={availableOptionsString}
          data-test-selected={this.state.patternAccessLevel}
          options={this.permissionLevelOptions}
          idSelected={this.state.patternAccessLevel}
          onChange={this.onPatternAccessLevelChange}
        />

        {this.state.patternAccessLevel === PATTERN_ACCESS_LEVELS.RBAC && (
          <Fragment>
            <EuiSpacer size="m" />
            <EuiInMemoryTable
              items={this.state.features}
              columns={this.permissionColumns}
            />
          </Fragment>
        )}
      </Fragment>
    );

    return (
      <Fragment>
        {permissions}
      </Fragment>
    );
  }
}

TenantRBAC.propTypes = {
  actionGroups: PropTypes.object.isRequired,
  roleActionGroups: PropTypes.array.isRequired,
  onPermissionsChange: PropTypes.func.isRequired,
};