import React from 'react';
import { connect } from 'formik';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { FormikFieldText, FormikSwitch, ContentPanel } from '../../../../components';
import WatchSchedule from '../WatchSchedule';
import { nameText, generalText, activeText } from '../../../../utils/i18n/common';
import { severityText } from '../../../../utils/i18n/watch';
import { isInvalid, hasError, validateName } from '../../../../utils/validate';
import { WatchService } from '../../../../services';

const ActiveSwitch = () => (
  <EuiFlexItem grow={false}>
    <FormikSwitch
      name="active"
      formRow
      rowProps={{
        hasEmptyLabelSpace: true,
      }}
      elementProps={{
        label: activeText,
        onChange: (e, field, form) => {
          form.setFieldValue(field.name, e.target.value);
        }
      }}
    />
  </EuiFlexItem>
);

const SeveritySwitch = () => (
  <EuiFlexItem grow={false}>
    <FormikSwitch
      name="_ui.isSeverity"
      formRow
      rowProps={{
        hasEmptyLabelSpace: true,
      }}
      elementProps={{
        label: severityText,
        onChange: (e, field, form) => {
          form.setFieldValue(field.name, e.target.value);
        }
      }}
    />
  </EuiFlexItem>
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
        validate: validateName(new WatchService(httpClient), isUpdatingName)
      }}
    />
  </EuiFlexItem>
);

WatchName.propTypes = {
  httpClient: PropTypes.func.isRequired,
  isUpdatingName: PropTypes.bool.isRequired
};

const GeneralPanel = ({ httpClient, location, formik }) => {
  const { id } = queryString.parse(location.search);
  const isUpdatingName = id !== formik.values._id;

  return (
    <ContentPanel
      title={generalText}
      titleSize="s"
    >
      <EuiFlexGroup
        justifyContent="spaceBetween"
        alignItems="center"
      >
        <WatchName httpClient={httpClient} isUpdatingName={isUpdatingName} />
        <EuiFlexItem grow={false}>
          <EuiFlexGroup>
            <ActiveSwitch />
            <SeveritySwitch />
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <WatchSchedule />
    </ContentPanel>
  );
};

GeneralPanel.propTypes = {
  httpClient: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired
};

export default connect(GeneralPanel);
