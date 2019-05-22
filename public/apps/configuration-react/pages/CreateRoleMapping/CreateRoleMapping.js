import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import {
  saveText,
  cancelText,
  inspectText,
  nameText
} from '../../utils/i18n/common';
import {
  createRoleMappingText,
  updateRoleMappingText
} from '../../utils/i18n/role_mappings';
import {
  rolesText,
  usersText,
  hostsText
} from '../../utils/i18n/roles';
import { ContentPanel, FormikFieldText, FormikComboBox } from '../../components';
import { APP_PATH, ROLE_MAPPINGS_ACTIONS } from '../../utils/constants';
import { isInvalid, hasError, validateName } from '../../utils/validation';
import { DEFAULT_ROLE_MAPPING } from './utils/constants';
import { roleMappingToFormik, formikToRoleMapping } from './utils';

class CreateRoleMapping extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: roleMappingToFormik(DEFAULT_ROLE_MAPPING, id),
      isLoading: true
    };

    this.backendService = this.props.roleMappingsService;
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
        this.setState({ resource: roleMappingToFormik(resource, id) });
      } else {
        this.setState({ resource: roleMappingToFormik(DEFAULT_ROLE_MAPPING), isEdit: !!id });
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
      await this.backendService.save(_name, formikToRoleMapping(values));
      setSubmitting(false);
      history.push(APP_PATH.ROLE_MAPPINGS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.ROLE_MAPPINGS)}>
      {cancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  render() {
    const { history, onTriggerInspectJsonFlyout, location, roleMappingsService } = this.props;
    const { resource, isLoading } = this.state;
    const { action, id } = queryString.parse(location.search);
    const updateRoleMapping = action === ROLE_MAPPINGS_ACTIONS.UPDATE_ROLE_MAPPING;
    const titleText = updateRoleMapping ? updateRoleMappingText : createRoleMappingText;

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
                this.renderCancelButton(history),
                this.renderSaveButton({ handleSubmit, isSubmitting })
              ]}
            >
              <EuiButton
                size="s"
                iconType="inspect"
                onClick={() => {
                  onTriggerInspectJsonFlyout({
                    json: formikToRoleMapping(values),
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
                  validate: validateName(roleMappingsService, isUpdatingName)
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
              <FormikComboBox
                name="_users"
                formRow
                rowProps={{
                  label: usersText,
                }}
                elementProps={{
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched('_users', true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue('_users', options);
                  },
                  onCreateOption: (label, field, form) => {
                    const normalizedSearchValue = label.trim().toLowerCase();
                    if (!normalizedSearchValue) return;
                    form.setFieldValue(`_users`, field.value.concat({ label }));
                  }
                }}
              />
              <FormikComboBox
                name="_backendRoles"
                formRow
                rowProps={{
                  label: rolesText,
                }}
                elementProps={{
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched('_backendRoles', true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue('_backendRoles', options);
                  },
                  onCreateOption: (label, field, form) => {
                    const normalizedSearchValue = label.trim().toLowerCase();
                    if (!normalizedSearchValue) return;
                    form.setFieldValue(`_backendRoles`, field.value.concat({ label }));
                  }
                }}
              />
              <FormikComboBox
                name="_hosts"
                formRow
                rowProps={{
                  label: hostsText,
                }}
                elementProps={{
                  isClearable: true,
                  onBlur: (e, field, form) => {
                    form.setFieldTouched('_hosts', true);
                  },
                  onChange: (options, field, form) => {
                    form.setFieldValue('_hosts', options);
                  },
                  onCreateOption: (label, field, form) => {
                    const normalizedSearchValue = label.trim().toLowerCase();
                    if (!normalizedSearchValue) return;
                    form.setFieldValue(`_hosts`, field.value.concat({ label }));
                  }
                }}
              />
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateRoleMapping.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  roleMappingsService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default CreateRoleMapping;
