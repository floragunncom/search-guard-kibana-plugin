import React, { Component } from 'react';
import { FieldArray } from 'formik';
import PropTypes from 'prop-types';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  EuiCodeEditor,
  EuiFormRow,
  EuiSpacer,
  EuiLoadingSpinner,
} from '@elastic/eui';
import {
  FormikCodeEditor,
  DeleteButtonIcon,
  ExecuteButtonIcon,
} from '../../../../../components';
import { checkText } from '../../../../utils/i18n/watch';
import { responseText } from '../../../../utils/i18n/common';
import { isInvalid, hasError, validateJsonString } from '../../../../../utils/validate';

const EDITOR_OPTIONS = {
  minLines: 15,
  maxLines: 15,
  tabSize: 2,
  useSoftTabs: true
};

const EDITOR_MODE = 'json';

// This component must be class because react-draggable-list lib requires it
class Block extends Component {
  getDragHeight = () => this.props.item.subtitle ? 112 : 56;

  renderCheckEditor = index => (
    <FormikCodeEditor
      name={`_ui.checksBlocks.${index}.check`}
      formRow
      rowProps={{
        fullWidth: true,
        label: checkText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        width: '100%',
        isInvalid,
        setOptions: EDITOR_OPTIONS,
        mode: EDITOR_MODE,
        onChange: (query, field, form) => {
          form.setFieldValue(field.name, query);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateJsonString,
      }}
    />
  );

  renderCheckResponse = response => {
    const { commonProps: { isLoading } } = this.props;
    if (isLoading) {
      return (
        <div style={{ margin: 'auto' }}>
          <EuiLoadingSpinner size="xl" />
        </div>
      );
    }

    if (!response) return null;

    return (
      <EuiFormRow label={responseText} fullWidth>
        <EuiCodeEditor
          width="100%"
          isReadOnly
          mode={EDITOR_MODE}
          setOptions={EDITOR_OPTIONS}
          value={response}
        />
      </EuiFormRow>
    );
  };

  render() {
    const {
      item: { index, check, response },
      itemSelected,
      dragHandleProps,
      commonProps: {
        onExecuteBlocks,
        onDeleteBlock,
      },
    } = this.props;

    const scale = itemSelected * 0.05 + 1;
    const shadow = itemSelected * 15 + 1;
    const dragged = itemSelected !== 0;
    const title = `${check.slice(0, 142)}...`;

    const actions = [
      <ExecuteButtonIcon
        isDisabled={dragged}
        onClick={() => onExecuteBlocks(0, index)}
      />,
      <ExecuteButtonIcon
        name={`single-${index}`}
        iconType="bullseye"
        isDisabled={dragged}
        onClick={() => onExecuteBlocks(index, index)}
      />,
      <DeleteButtonIcon
        isDisabled={dragged}
        onClick={() => onDeleteBlock(index)}
      />
    ];

    const renderActions = (actions = []) =>
      actions.map((action, id) => (
        <EuiFlexItem grow={false} key={id}>{action}</EuiFlexItem>
      ));

    const style = {
      transform: `scale(${scale})`,
    };

    if (dragged) {
      style.boxShadow = `rgba(0, 0, 0, 0.3) 0px ${shadow}px ${2 * shadow}px 0px`;
    }

    return (
      <div
        className="blocksWatch-blocks-list-item"
        style={style}
      >
        <EuiPanel>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false} className="drag-handle">
              <EuiIcon type="grab" size="l" {...dragHandleProps}/>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText color="subdued" size="s"><p>{title}</p></EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                {renderActions(actions)}
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
          <FieldArray
            name="_ui.checksBlocks"
            render={() => (
              <EuiFlexGroup>
                <EuiFlexItem>{this.renderCheckEditor(index)}</EuiFlexItem>
                <EuiFlexItem>{this.renderCheckResponse(response)}</EuiFlexItem>
              </EuiFlexGroup>
            )}
          />
          <EuiSpacer />
        </EuiPanel>
      </div>
    );
  }
}

Block.propTypes = {
  item: PropTypes.shape({
    index: PropTypes.number.isRequired,
    check: PropTypes.string.isRequired,
    response: PropTypes.string.isRequired,
  }),
  itemSelected: PropTypes.number.isRequired,
  dragHandleProps: PropTypes.shape({
    onMouseDown: PropTypes.func.isRequired,
    onTouchStart: PropTypes.func.isRequired,
  }),
  commonProps: PropTypes.shape({
    onExecuteBlocks: PropTypes.func.isRequired,
    onDeleteBlock: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
  }),
};

export default Block;
