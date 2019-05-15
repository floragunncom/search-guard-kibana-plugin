import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import {
  saveText,
  cancelText,
  inspectText,
  nameText,
  descriptionText
} from '../../utils/i18n/common';
import { createTenantText, updateTenantText } from '../../utils/i18n/tenants';
import { ContentPanel, FormikFieldText } from '../../components';
import { APP_PATH, TENANTS_ACTIONS } from '../../utils/constants';
import { isInvalid, hasError, validateTextField, validateTenantName } from '../../utils/validation';
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
        let resource = await this.backendService.get(id);
        resource = tenantToFormik(resource, id);
        this.setState({ resource });
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
    const { name } = values;
    try {
      await this.backendService.save(name, formikToTenant(values));
      setSubmitting(false);
      history.push(APP_PATH.TENANTS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.TENANTS)}>
      {cancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  render() {
    const { history, onTriggerInspectJsonFlyout, location, tenantsService } = this.props;
    const { resource, isEdit, isLoading } = this.state;
    const { action } = queryString.parse(location.search);
    const updateTenant = action === TENANTS_ACTIONS.UPDATE_TENANT;
    const titleText = updateTenant ? updateTenantText : createTenantText;

    return (
      <Formik
        initialValues={resource}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          return (
            <ContentPanel
              title={titleText}
              isLoading={isLoading}
              actions={[
                this.renderCancelButton(history),
                this.renderSaveButton({ handleSubmit, isSubmitting })
              ]}
            >
              <EuiButton
                size="s"
                iconType="inspect"
                onClick={() => {
                  onTriggerInspectJsonFlyout({
                    json: formikToTenant(values),
                    title: titleText
                  });
                }}
              >
                {inspectText}
              </EuiButton>
              <EuiSpacer />

              <FormikFieldText
                formRow
                formikFieldProps={{
                  validate: validateTenantName(tenantsService, isEdit)
                }}
                rowProps={{
                  label: nameText,
                  isInvalid,
                  error: hasError
                }}
                elementProps={{
                  isInvalid
                }}
                name="name"
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
