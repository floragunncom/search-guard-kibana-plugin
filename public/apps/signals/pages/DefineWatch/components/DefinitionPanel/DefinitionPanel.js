import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { FormikSelect, ContentPanel } from '../../../../components';
import JsonWatch from '../JsonWatch';
import GraphWatch from '../GraphWatch';
import { definitionText, typeText, executeText } from '../../../../utils/i18n/common';
import { formikToWatch } from '../../utils';
import { WatchService } from '../../../../services';
import { addErrorToast } from '../../../../redux/actions';
import { WATCH_TYPE_SELECT, WATCH_TYPE } from '../../utils/constants';

class DefinitionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false
    };

    this.watchService = new WatchService(this.props.httpClient);
  }

  handleChecksResult = (result = {}) => {
    const { formik: { setFieldValue } } = this.props;
    setFieldValue('_checksResult', result);
  }

  executeJsonWatch = async values => {
    const { dispatch } = this.props;

    try {
      this.setState({ isLoading: true });
      const { ok, resp } = await this.watchService.execute(formikToWatch(values));
      this.handleChecksResult(resp);
      if (!ok) {
        console.log('!ok', resp);
        dispatch(addErrorToast(resp));
      }
    } catch (error) {
      console.error('DefinitionPanel -- executeJsonWatch', error);
      dispatch(addErrorToast(error));
    }
    this.setState({ isLoading: false });
  }

  renderExecuteJsonWatchButton = values => (
    <EuiButton
      isLoading={this.state.isLoading}
      data-test-subj="sgWatch-Execute"
      id="execute"
      onClick={() => this.executeJsonWatch(values)}
    >
      {executeText}
    </EuiButton>
  )

  render() {
    const {
      formik: { values = {} },
      dispatch,
      httpClient
    } = this.props;
    const isGraphWatch = values._watchType === WATCH_TYPE.GRAPH;

    const actions = [];
    if (!isGraphWatch) {
      actions.push(this.renderExecuteJsonWatchButton(values));
    }

    return (
      <ContentPanel
        title={definitionText}
        titleSize="s"
        bodyStyles={{ padding: 'initial', paddingLeft: '10px' }}
        actions={actions}
      >
        <div style={{ paddingLeft: '10px' }}>
          <FormikSelect
            name="_watchType"
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
          {isGraphWatch
            ? <GraphWatch dispatch={dispatch} httpClient={httpClient} />
            : <JsonWatch dispatch={dispatch} onChecksResult={this.handleChecksResult} />
          }
        </div>
      </ContentPanel>
    );
  }
}

DefinitionPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  httpClient: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired
};

export default connectFormik(DefinitionPanel);
