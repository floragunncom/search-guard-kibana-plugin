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
      bodyStyles={{ padding: 'initial', paddingLeft: '10px' }}
    >
      <div style={{ maxWidth: '1200px' }}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <FormikFieldText
              name="_id"
              formRow
              rowProps={{
                label: nameText,
                style: { paddingLeft: '10px' },
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
          <EuiFlexItem>
            <FormikSwitch
              name="active"
              formRow
              rowProps={{
                hasEmptyLabelSpace: true,
                style: { paddingLeft: '0px' }
              }}
              elementProps={{ label: activeText }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
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
