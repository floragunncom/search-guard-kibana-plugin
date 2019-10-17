import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import {
  FormikSelect,
  ContentPanel,
  HelpButton
} from '../../../../components';
import JsonWatch from '../JsonWatch';
import GraphWatch from '../GraphWatch';
import BlocksWatch from '../BlocksWatch';
import { definitionText, typeText, executeText } from '../../../../utils/i18n/common';
import { formikToWatch, buildFormikChecksBlocks } from '../../utils';
import { WatchService } from '../../../../services';
import { addErrorToast } from '../../../../redux/actions';
import { stringifyPretty } from '../../../../utils/helpers';
import { WATCH_TYPE_SELECT, WATCH_TYPE } from '../../utils/constants';
import ChecksHelpFlyout from '../ChecksHelpFlyout';

class DefinitionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isChecksHelpFlyoutOpen: false,
      insertAceText: {
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
  addCheckTemplate = (checkTemplate = {}) => {
    const { formik: { values, setFieldValue }, dispatch } = this.props;
    const { _ui: { watchType, checksBlocks }, checks } = values;

    try {
      if (watchType === WATCH_TYPE.BLOCKS) {
        const checkBlock = buildFormikChecksBlocks([checkTemplate])[0];
        checkBlock.id = checksBlocks.length;

        setFieldValue('_ui.checksBlocks', [...checksBlocks, checkBlock]);
      } else { // JsonWatch
        const { row, column } = this.state.insertAceText;
        const isInsertingCheck = Number.isInteger(row) && Number.isInteger(column);

        if (isInsertingCheck) {
          this.setState({ insertAceText: { row, column, text: stringifyPretty(checkTemplate) } });
        } else { // Append check
          setFieldValue('checks', stringifyPretty([...JSON.parse(checks), checkTemplate]));
        }
      }
    } catch (error) {
      console.error('DefintionPanel -- addCheckTemplate', error);
      dispatch(addErrorToast(error));
      console.debug('DefintionPanel -- formik values', values);
      console.debug('DefintionPanel -- checkTemplate', checkTemplate);
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
      formik: { values = {} },
      httpClient,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
      onTriggerConfirmDeletionModal,
    } = this.props;

    const { isChecksHelpFlyoutOpen } = this.state;

    const isGraphWatch = values._ui.watchType === WATCH_TYPE.GRAPH;
    const isJsonWatch = values._ui.watchType === WATCH_TYPE.JSON;

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
        <HelpButton onClick={() => this.setState({ isChecksHelpFlyoutOpen: true })} />,
        this.renderExecuteWatchButton(values)
      ];

      watchDefinition = (
        <JsonWatch
          httpClient={httpClient}
          insertAceText={this.state.insertAceText}
          onInsertAceText={({ row, column }) => {
            // Text is updated by this.addCheckTemplate
            this.setState({ insertAceText: { row, column, text: undefined } });
          }}
        />
      );
    } else { // BlocksWatch
      actions = [
        <HelpButton onClick={() => this.setState({ isChecksHelpFlyoutOpen: true })} />,
        this.renderExecuteWatchButton(values)
      ];

      watchDefinition = (
        <BlocksWatch
          httpClient={httpClient}
          onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
          onOpenChecksHelpFlyout={() => {
            this.setState({ isChecksHelpFlyoutOpen: true });
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
        {isChecksHelpFlyoutOpen && (
          <ChecksHelpFlyout
            onClose={() => this.setState({ isChecksHelpFlyoutOpen: false })}
            onAdd={this.addCheckTemplate}
          />
        )}

        <div>
          <FormikSelect
            name="_ui.watchType"
            formRow
            rowProps={{
              label: typeText
            }}
            elementProps={{
              options: WATCH_TYPE_SELECT,
              onChange: (e, field, form) => {
                form.setFieldValue(field.name, e.target.value);
              },
            }}
          />
          {watchDefinition}
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
};

export default connectRedux()(connectFormik(DefinitionPanel));
