import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import {
  FormikSelect,
  ContentPanel,
  AddButton
} from '../../../../components';
import JsonWatch from '../JsonWatch';
import GraphWatch from '../GraphWatch';
import BlocksWatch from '../BlocksWatch';
import QueryStat from '../QueryStat';
import SeverityForm from '../SeverityForm';
import {
  formikToWatch,
  buildFormikChecksBlocks,
  buildChecks,
  buildFormikChecks,
} from '../../utils';
import { WatchService } from '../../../../services';
import { addErrorToast, addSuccessToast } from '../../../../redux/actions';
import { WATCH_TYPES_OPTIONS, WATCH_TYPES } from '../../utils/constants';
import { FLYOUTS } from '../../../../utils/constants';
import { definitionText, typeText, executeText } from '../../../../utils/i18n/common';
import { addedCheckTemplateText } from '../../../../utils/i18n/watch';

class DefinitionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      insertCheckTemplate: {
        row: undefined,
        column: undefined,
        text: undefined,
      }
    };

    this.watchService = new WatchService(this.props.httpClient);
  }

  // Only for JsonWatch and BlocksWatch
  executeWatch = async values => {
    const { dispatch, formik: { setFieldValue } } = this.props;
    this.setState({ isLoading: true });

    try {
      const { ok, resp } = await this.watchService.execute(formikToWatch(values));
      setFieldValue('_ui.checksResult', resp);

      if (!ok) throw resp;
    } catch (error) {
      console.error('DefinitionPanel -- executeWatch', error);
      dispatch(addErrorToast(error));
      console.debug('DefinitionPanel -- formik values', values);
    }

    this.setState({ isLoading: false });
  };

  // Only for JsonWatch and BlocksWatch
  addCheckExample = (checkTemplate = {}) => {
    const { formik: { values = {}, setFieldValue } = {}, dispatch } = this.props;
    const ui = values._ui;
    const checks = values.checks;
    const watchType = get(values, '_ui.watchType');
    const checksBlocks = get(values, '_ui.checksBlocks');

    try {
      if (watchType === WATCH_TYPES.BLOCKS) {
        const checkBlock = buildFormikChecksBlocks([checkTemplate])[0];
        checkBlock.id = checksBlocks.length;

        setFieldValue('_ui.checksBlocks', [...checksBlocks, checkBlock]);
      } else { // JsonWatch
        const { row, column } = this.state.insertCheckTemplate;
        const isInsertingCheck = Number.isInteger(row) && Number.isInteger(column);

        if (isInsertingCheck) {
          this.setState({
            insertCheckTemplate: {
              row,
              column: column - 1,
              // Add new line to prevent checks nesting
              text: buildFormikChecks(checkTemplate) + '\n'
            }
          });
        } else { // Append check (works only the first time)
          const newChecks = buildFormikChecks([ ...buildChecks({ checks, _ui: ui }), checkTemplate ]);
          setFieldValue('checks', newChecks);
        }
      }
      dispatch(addSuccessToast(<p>{addedCheckTemplateText}</p>));
    } catch (error) {
      console.error('DefintionPanel -- addCheckExample', error);
      dispatch(addErrorToast(error));
      console.debug('DefintionPanel -- addCheckExample -- formik values', values);
      console.debug('DefintionPanel -- addCheckExample -- checkTemplate', checkTemplate);
    }
  };

  // Only for JsonWatch and BlocksWatch
  renderExecuteWatchButton = values => (
    <EuiButton
      iconType="play"
      isLoading={this.state.isLoading}
      data-test-subj="sgWatch-Execute"
      id="execute"
      onClick={() => this.executeWatch(values)}
    >
      {executeText}
    </EuiButton>
  );

  render() {
    const {
      formik: { values },
      httpClient,
      onTriggerFlyout,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
      onTriggerConfirmDeletionModal,
    } = this.props;

    const isSeverity = values._ui.isSeverity;
    const isGraphWatch = values._ui.watchType === WATCH_TYPES.GRAPH;
    const isJsonWatch = values._ui.watchType === WATCH_TYPES.JSON;

    let actions = [];
    let watchDefinition;

    if (isGraphWatch) {
      watchDefinition = (<GraphWatch
        httpClient={httpClient}
        onComboBoxChange={onComboBoxChange}
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />);
    } else if (isJsonWatch) {
      actions = [
        <AddButton
          onClick={() => {
            onTriggerFlyout({
              type: FLYOUTS.CHECK_EXAMPLES,
              payload: { onAdd: this.addCheckExample }
            });
          }}
        />,
        this.renderExecuteWatchButton(values)
      ];

      watchDefinition = (
        <JsonWatch
          httpClient={httpClient}
          insertCheckTemplate={this.state.insertCheckTemplate}
          onChange={({ row, column }) => {
            this.setState({ insertCheckTemplate: { row, column, text: undefined } });
          }}
        />
      );
    } else { // BlocksWatch
      actions = [
        <AddButton
          onClick={() => {
            onTriggerFlyout({
              type: FLYOUTS.CHECK_EXAMPLES,
              payload: { onAdd: this.addCheckExample }
            });
          }}
        />,
        this.renderExecuteWatchButton(values)
      ];

      watchDefinition = (
        <BlocksWatch
          httpClient={httpClient}
          onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
          onOpenChecksHelpFlyout={() => {
            onTriggerFlyout({
              type: FLYOUTS.CHECK_EXAMPLES,
              payload: { onAdd: this.addCheckExample }
            });
          }}
        />
      );
    }

    return (
      <ContentPanel
        title={definitionText}
        titleSize="s"
        actions={actions}
      >
        <div>
          <FormikSelect
            name="_ui.watchType"
            formRow
            rowProps={{
              label: typeText
            }}
            elementProps={{
              options: WATCH_TYPES_OPTIONS,
              onChange: (e, field, form) => {
                form.setFieldValue(field.name, e.target.value);
                form.setFieldValue('_ui.checksResult', null);
              },
            }}
          />
          {watchDefinition}
          {(isGraphWatch || isJsonWatch) && (
            <>
              <EuiSpacer />
              <QueryStat />
            </>
          )}
          <EuiSpacer />
          {!isGraphWatch && isSeverity && <SeverityForm isTitle />}
        </div>
      </ContentPanel>
    );
  }
}

DefinitionPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  httpClient: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  onTriggerFlyout: PropTypes.func.isRequired,
};

export default connectRedux()(connectFormik(DefinitionPanel));
