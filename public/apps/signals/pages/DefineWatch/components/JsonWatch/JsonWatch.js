import React, { Component, Fragment } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { isEmpty, map, startCase, includes } from 'lodash';
import {
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiButton,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiText,
  EuiTitle,
  EuiCodeBlock,
  EuiSpacer,
  EuiLink,
  EuiTabbedContent
} from '@elastic/eui';
import 'brace/theme/github';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import {
  FormikCodeEditor,
  HelpButton,
  LabelAppendLink,
  AddButton
} from '../../../../components';
import { responseText, helpText, closeText } from '../../../../utils/i18n/common';
import { checksText } from '../../../../utils/i18n/watch';
import templates from './utils/templates';
import { QUERIES } from './utils/constants';
import { addErrorToast } from '../../../../redux/actions';
import { stringifyPretty } from '../../../../utils/helpers';
import { hasError, isInvalid, validateJsonString } from '../../../../utils/validate';

// TODO: move templates flyout to a separate component
class JsonWatch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlyoutVisible: false,
      isSwitchChecked: true
    };

    this.closeFlyout = this.closeFlyout.bind(this);
    this.showFlyout = this.showFlyout.bind(this);

    this.tabs = Object.values(QUERIES).reduce((acc, queryName) => {
      acc.push({
        id: queryName,
        name: startCase(queryName),
        content: this.renderTemplates(queryName)
      });
      return acc;
    }, []);
  }

  onSwitchChange = () => {
    this.setState({
      isSwitchChecked: !this.state.isSwitchChecked,
    });
  };

  addCheckTemplate = (template, type) => {
    const { formik, dispatch } = this.props;
    try {
      const oldChecks = JSON.parse(formik.values.checks);
      let newCheck = {
        type: 'search',
        name: 'newsearch',
        target: 'newsearch',
        request: {
          indices: [],
          body: JSON.parse(template)
        }
      };
      if (includes(type, 'condition')) {
        newCheck = JSON.parse(template);
      }

      formik.setFieldValue('checks', stringifyPretty([...oldChecks, newCheck]));
    } catch (err) {
      dispatch(addErrorToast('wrong checks syntax'));
    }
  }

  closeFlyout() {
    this.setState({ isFlyoutVisible: false });
  }

  showFlyout() {
    this.setState({ isFlyoutVisible: true });
  }

  renderTemplates = category => (
    map(templates[category], ({ example, link, description, type }, name) => (
      <div key={name}>
        <EuiSpacer />
        <EuiFormRow
          label={startCase(name)}
          labelAppend={<LabelAppendLink href={link} name={`CheckExample-${name}`} />}
        >
          <EuiCodeBlock
           language="json"
           data-test-subj={`sgCodeBlock-CheckExample-${name}`}
          >
            {example}
          </EuiCodeBlock>
        </EuiFormRow>
        <AddButton
          onClick={() => this.addCheckTemplate(example, type)}
          name={`CheckExample-${name}`}
        />
      </div>
    ))
  )

  render() {
    const { formik: { values: { _checksResult = null } }, onChecksResult } = this.props;
    const response = !isEmpty(_checksResult) ? stringifyPretty(_checksResult) : null;
    const { isFlyoutVisible } = this.state;
    let flyout = null;

    // TODO: use flyout from Main.js instead
    if (isFlyoutVisible) {
      flyout = (
        <EuiFlyout size="l" onClose={this.closeFlyout} aria-labelledby="flyoutTitle">
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2 id="flyoutTitle">{helpText}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiTabbedContent
              tabs={this.tabs}
              initialSelectedTab={this.tabs[0]}
            />
          </EuiFlyoutBody>
        </EuiFlyout>
      );
    }

    return (
      <Fragment>
        <HelpButton onClick={this.showFlyout} />
        {flyout}
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <FormikCodeEditor
              name="checks"
              formRow
              rowProps={{
                label: checksText,
                fullWidth: true,
                isInvalid,
                error: hasError,
              }}
              elementProps={{
                isInvalid,
                setOptions: {
                  tabSize: 2,
                  useSoftTabs: true
                },
                mode: 'json',
                width: '100%',
                height: '500px',
                theme: 'github',
                onChange: (query, field, form) => {
                  form.setFieldValue(field.name, query);
                },
                onBlur: (e, field, form) => {
                  form.setFieldTouched(field.name, true);
                },
              }}
              formikFieldProps={{
                validate: validateJsonString
              }}
            />
          </EuiFlexItem>
          {!isEmpty(response) && (
            <EuiFlexItem>
              <EuiFormRow
                label={responseText}
                labelAppend={(
                  <EuiText size="xs" onClick={() => onChecksResult(null)}>
                    <EuiLink id="close-response" data-test-subj="sgWatch-CloseResponse">{closeText} X</EuiLink>
                  </EuiText>
                )}
                fullWidth
              >
                <EuiCodeEditor
                  mode="json"
                  theme="github"
                  width="100%"
                  height="500px"
                  value={response}
                  readOnly
                />
              </EuiFormRow>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </Fragment>
    );
  }
}

JsonWatch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onChecksResult: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired
};

export default connectFormik(JsonWatch);
