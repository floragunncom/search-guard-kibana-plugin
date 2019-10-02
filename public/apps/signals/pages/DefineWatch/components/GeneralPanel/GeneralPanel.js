import React from 'react';
import { connect } from 'formik';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { FormikFieldText, FormikSwitch, ContentPanel } from '../../../../components';
import WatchSchedule from '../WatchSchedule';
import { nameText, generalText, activeText } from '../../../../utils/i18n/common';
import { isInvalid, hasError, validateName } from '../../../../utils/validate';
import { WatchService } from '../../../../services';

const GeneralPanel = ({ httpClient, location, formik }) => {
  const { id } = queryString.parse(location.search);
  const isUpdatingName = id !== formik.values._id;

  return (
    <ContentPanel
      title={generalText}
      titleSize="s"
    >
      <EuiFlexGroup className="sg-flex-group" justifyContent="spaceBetween">
        <EuiFlexItem className="sg-flex-item">
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
        <EuiFlexItem grow={false} className="sg-flex-item">
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
