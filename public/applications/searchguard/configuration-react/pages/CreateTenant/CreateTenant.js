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
import {
  ContentPanel,
  FormikFieldText,
  InspectButton,
  CancelButton,
  SaveButton
} from '../../components';
import { APP_PATH, TENANTS_ACTIONS } from '../../utils/constants';
import { isInvalid, hasError, validateName } from '../../utils/validation';
import { DEFAULT_TENANT } from './utils/constants';
import { tenantToFormik, formikToTenant } from './utils';
import { TenantsService } from '../../services';
import { Context } from '../../Context';

class CreateTenant extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { location } = this.props;
    this.backendService = new TenantsService(context.httpClient);
    const { id } = queryString.parse(location.search);

    this.state = {
      id,
      isEdit: !!id,
      resource: tenantToFormik(DEFAULT_TENANT, id),
      isLoading: true
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount = () => {
    this.context.closeFlyout();
  }

  fetchData = async () => {
    const { id } = this.state;
    const { triggerErrorCallout } = this.context;
    try {
      this.setState({ isLoading: true });
      if (id) {
        const resource = await this.backendService.get(id);
        this.setState({ resource: tenantToFormik(resource, id) });
      } else {
        this.setState({ resource: tenantToFormik(DEFAULT_TENANT), isEdit: !!id });
      }
    } catch(error) {
      triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history } = this.props;
    const { triggerErrorCallout } = this.context;
    const { _name } = values;
    try {
      await this.backendService.save(_name, formikToTenant(values));
      setSubmitting(false);
      history.push(APP_PATH.TENANTS);
    } catch (error) {
      setSubmitting(false);
      triggerErrorCallout(error);
    }
  }

  render() {
    const { history, location } = this.props;
    const { triggerInspectJsonFlyout } = this.context;
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
      >
        {({ values, handleSubmit, isSubmitting }) => {
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
                  triggerInspectJsonFlyout({
                    json: formikToTenant(values),
                    title: titleText
                  });
                }}
              />
              <EuiSpacer />

              <FormikFieldText
                formRow
                formikFieldProps={{
                  validate: validateName(this.backendService, isUpdatingName)
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
                rowProps={{
                  label: descriptionText,
                }}
                elementProps={{
                  isInvalid
                }}
                name="description"
              />
            </ContentPanel>
          );
        }}
      </Formik>
    );
  }
}

CreateTenant.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default CreateTenant;
