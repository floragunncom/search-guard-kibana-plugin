import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import {
  nameText,
  descriptionText
} from '../../utils/i18n/common';
import { createTenantText, updateTenantText } from '../../utils/i18n/tenants';
import { ContentPanel, FormikFieldText, InspectButton } from '../../components';
import { CancelButton, SaveButton } from '../../components/ContentPanel/components';
import { APP_PATH, TENANTS_ACTIONS } from '../../utils/constants';
import { isInvalid, hasError, validateTextField, validateName } from '../../utils/validation';
import { DEFAULT_TENANT } from './utils/constants';
import { tenantToFormik, formikToTenant } from './utils';

class CreateTenant extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: tenantToFormik(DEFAULT_TENANT, id),
      isLoading: true
    };

    this.backendService = this.props.tenantsService;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps({ location }) {
    const { id } = queryString.parse(location.search);
    const { id: currentId } = this.state;
    if (id !== currentId) {
      this.setState({ id }, () => {
        this.fetchData();
      });
    }
  }

  fetchData = async () => {
    const { id } = this.state;
    const { onTriggerErrorCallout } = this.props;
    try {
      this.setState({ isLoading: true });
      if (id) {
        const resource = await this.backendService.get(id);
        this.setState({ resource: tenantToFormik(resource, id) });
      } else {
        this.setState({ resource: tenantToFormik(DEFAULT_TENANT), isEdit: !!id });
      }
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history, onTriggerErrorCallout } = this.props;
    const { _name } = values;
    try {
      await this.backendService.save(_name, formikToTenant(values));
      setSubmitting(false);
      history.push(APP_PATH.TENANTS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  render() {
    const { history, onTriggerInspectJsonFlyout, location, tenantsService } = this.props;
    const { resource, isLoading } = this.state;
    const { action, id } = queryString.parse(location.search);
    const updateTenant = action === TENANTS_ACTIONS.UPDATE_TENANT;
    const titleText = updateTenant ? updateTenantText : createTenantText;

    return (
      <Formik
        initialValues={resource}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          const isUpdatingName = id !== values._name;

          return (
            <ContentPanel
              title={titleText}
              isLoading={isLoading}
              actions={[
                (<CancelButton onClick={() => history.push(APP_PATH.TENANTS)} />),
                (<SaveButton isLoading={isSubmitting} onClick={handleSubmit} />)
              ]}
            >
              <InspectButton
                onClick={() => {
                  onTriggerInspectJsonFlyout({
                    json: formikToTenant(values),
                    title: titleText
                  });
                }}
              />
              <EuiSpacer />

              <FormikFieldText
                formRow
                formikFieldProps={{
                  validate: validateName(tenantsService, isUpdatingName)
                }}
                rowProps={{
                  label: nameText,
                  isInvalid,
                  error: hasError
                }}
                elementProps={{
                  isInvalid
                }}
                name="_name"
              />
              <FormikFieldText
                formRow
                formikFieldProps={{
                  validate: validateTextField
                }}
                rowProps={{
                  label: descriptionText,
                  isInvalid,
                  error: hasError
                }}
                elementProps={{
                  isInvalid
                }}
                name="description"
              />
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateTenant.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  tenantsService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default CreateTenant;
