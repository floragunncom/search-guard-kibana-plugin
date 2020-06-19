/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiAccordion,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiCallOut,
  EuiButtonIcon,
  EuiToolTip,
  EuiLoadingSpinner,
} from '@elastic/eui';
import {
  StaticCheckBlockForm,
  HttpCheckBlockForm,
  SearchCheckBlockForm,
  ConditionCheckBlockForm,
  TransformCheckBlockForm,
  CalcCheckBlockForm,
} from './forms';
import { shorterCheckName } from './utils/helpers';
import {
  STATIC_DEFAULTS,
  SEARCH_DEFAULTS,
  HTTP_DEFAULTS,
  CONDITION_DEFAULTS,
  TRANSFORM_DEFAULTS,
  CALC_DEFAULTS,
} from './utils/checkBlocks';
import {
  deleteText,
  executeBlocksAboveAndThisBlockText,
  executeOnlyThisBlockText,
  executeText,
} from '../../../../utils/i18n/watch';

export function CheckBlockExtraButton({ isLoading, toolTipProps, buttonProps }) {
  return (
    <EuiToolTip {...toolTipProps}>
      {isLoading ? <EuiLoadingSpinner size="m" /> : <EuiButtonIcon {...buttonProps} />}
    </EuiToolTip>
  );
}

export function CheckBlock({
  sgBlocksWatchId,
  isLoading,
  accordionId,
  index,
  provided,
  checkBlock,
  checksBlocksPath,
  onDeleteBlock,
  onCloseResult,
  onExecuteBlock,
}) {
  let form;

  switch (checkBlock.type) {
    case STATIC_DEFAULTS.type:
      form = (
        <StaticCheckBlockForm
          index={index}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case SEARCH_DEFAULTS.type:
      form = (
        <SearchCheckBlockForm
          index={index}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case HTTP_DEFAULTS.type:
      form = (
        <HttpCheckBlockForm
          index={index}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case CONDITION_DEFAULTS.type:
      form = (
        <ConditionCheckBlockForm
          index={index}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case TRANSFORM_DEFAULTS.type:
      form = (
        <TransformCheckBlockForm
          index={index}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case CALC_DEFAULTS.type:
      form = (
        <CalcCheckBlockForm
          index={index}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    default:
      form = (
        <EuiCallOut
          title={`Wrong check type "${checkBlock.type}"`}
          color="danger"
          iconType="alert"
        />
      );
      break;
  }

  function renderExtraAction() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <CheckBlockExtraButton
            toolTipProps={{
              title: executeText,
              content: executeBlocksAboveAndThisBlockText,
            }}
            buttonProps={{
              'aria-label': 'execute-cascade',
              iconType: 'play',
              onClick: () => onExecuteBlock(0, index),
            }}
            isLoading={isLoading}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <CheckBlockExtraButton
            toolTipProps={{
              title: executeText,
              content: executeOnlyThisBlockText,
            }}
            buttonProps={{
              'aria-label': 'execute',
              iconType: 'bullseye',
              onClick: () => onExecuteBlock(index),
            }}
            isLoading={isLoading}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <CheckBlockExtraButton
            toolTipProps={{
              title: deleteText,
            }}
            buttonProps={{
              'aria-label': 'delete',
              iconType: 'trash',
              color: 'danger',
              onClick: () => onDeleteBlock(index),
            }}
            isLoading={isLoading}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <div {...provided.dragHandleProps} id={`${sgBlocksWatchId}-dragHandle-${index}`}>
            <EuiIcon type="grab" />
          </div>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiAccordion
            id={accordionId}
            buttonContent={shorterCheckName(checkBlock.name)}
            extraAction={renderExtraAction()}
            paddingSize="l"
          >
            <div id={`${sgBlocksWatchId}-dragForm-${index}`}>{form}</div>
          </EuiAccordion>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

CheckBlock.propTypes = {
  sgBlocksWatchId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  accordionId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  provided: PropTypes.object.isRequired,
  checkBlock: PropTypes.object.isRequired,
  checksBlocksPath: PropTypes.string.isRequired,
  onDeleteBlock: PropTypes.func.isRequired,
  onCloseResult: PropTypes.func.isRequired,
  onExecuteBlock: PropTypes.func.isRequired,
};
