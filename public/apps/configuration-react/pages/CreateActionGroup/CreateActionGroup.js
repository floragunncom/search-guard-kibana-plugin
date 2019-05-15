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
} from '../../utils/i18n/common';
import {
  createActionGroupText,
  updateActionGroupText
} from '../../utils/i18n/action_groups';
import { ContentPanel, FormikFieldText } from '../../components';
import { APP_PATH, ACTION_GROUPS_ACTIONS } from '../../utils/constants';
import { isInvalid, hasError, validateActionGroupName } from '../../utils/validation';
import { DEFAULT_ACTION_GROUP } from './utils/constants';
import { actionGroupToFormik, formikToActionGroup } from './utils';

class CreateActionGroup extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: actionGroupToFormik(DEFAULT_ACTION_GROUP, id),
      isLoading: true
    };

    this.backendService = this.props.actionGroupsService;
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
        resource = actionGroupToFormik(resource, id);
        this.setState({ resource });
      } else {
        this.setState({ resource: actionGroupToFormik(DEFAULT_ACTION_GROUP), isEdit: !!id });
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
      await this.backendService.save(name, formikToActionGroup(values));
      setSubmitting(false);
      history.push(APP_PATH.ACTION_GROUPS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.ACTION_GROUPS)}>
      {cancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  render() {
    const { history, onTriggerInspectJsonFlyout, location, actionGroupsService } = this.props;
    const { resource, isEdit, isLoading } = this.state;
    const { action } = queryString.parse(location.search);
    const updateActionGroup = action === ACTION_GROUPS_ACTIONS.UPDATE_ACTION_GROUP;
    const titleText = updateActionGroup ? updateActionGroupText : createActionGroupText;

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
                    json: formikToActionGroup(values),
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
                  validate: validateActionGroupName(actionGroupsService, isEdit)
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
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateActionGroup.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  actionGroupsService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default CreateActionGroup;
