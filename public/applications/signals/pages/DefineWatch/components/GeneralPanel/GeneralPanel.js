/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { connect } from 'formik';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { get } from 'lodash';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiIconTip } from '@elastic/eui';
import { FormikFieldText, FormikSwitch, ContentPanel } from '../../../../components';
import WatchSchedule from '../WatchSchedule';
import { nameText, generalText, activeText } from '../../../../utils/i18n/common';
import {
  severityText,
  resolveText,
  watchSeverityShortHelpText,
  watchResolveActionShortHelpText,
} from '../../../../utils/i18n/watch';
import { isInvalid, hasError, validateName } from '../../../../utils/validate';
import { WatchService } from '../../../../services';

import { Context } from '../../../../Context';

const ActiveSwitch = ({ onSwitchChange: onChange }) => (
  <EuiFlexGroup alignItems="center" responsive={false}>
    <EuiFlexItem grow={false}>
      <FormikSwitch
        name="active"
        elementProps={{
          label: activeText,
          onChange,
        }}
      />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const SeveritySwitch = ({ onSwitchChange: onChange }) => (
  <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
    <EuiFlexItem grow={false}>
      <FormikSwitch
        name="_ui.isSeverity"
        elementProps={{
          label: severityText,
          onChange,
        }}
      />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiIconTip content={watchSeverityShortHelpText} position="top" />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const ResolveActionsSwitch = ({ onSwitchChange: onChange }) => (
  <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
    <EuiFlexItem grow={false}>
      <FormikSwitch
        name="_ui.isResolveActions"
        elementProps={{
          label: resolveText,
          onChange,
        }}
      />
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiIconTip content={watchResolveActionShortHelpText} position="bottom" />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const WatchName = ({ httpClient, isUpdatingName }) => (
  <EuiFlexItem>
    <FormikFieldText
      name="_id"
      formRow
      rowProps={{
        label: nameText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
      }}
      formikFieldProps={{
        validate: validateName(new WatchService(httpClient), isUpdatingName),
      }}
    />
  </EuiFlexItem>
);

WatchName.propTypes = {
  httpClient: PropTypes.object.isRequired,
  isUpdatingName: PropTypes.bool.isRequired,
};

const GeneralPanel = ({ location, formik: { values } }) => {
  const { onSwitchChange, httpClient } = useContext(Context);
  const { id } = queryString.parse(location.search);
  const isUpdatingName = id !== values._id;
  const isSeverity = get(values, '_ui.isSeverity', false);

  return (
    <ContentPanel title={generalText} titleSize="s">
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <WatchName httpClient={httpClient} isUpdatingName={isUpdatingName} />
        <EuiFlexItem grow={false}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <ActiveSwitch onSwitchChange={onSwitchChange} />
            </EuiFlexItem>
            <EuiFlexItem>
              <SeveritySwitch onSwitchChange={onSwitchChange} />
            </EuiFlexItem>
            <EuiFlexItem>
              {isSeverity && <ResolveActionsSwitch onSwitchChange={onSwitchChange} />}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <WatchSchedule />
    </ContentPanel>
  );
};

GeneralPanel.propTypes = {
  location: PropTypes.object.isRequired,
};

export default connect(GeneralPanel);
