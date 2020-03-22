/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState, useContext, useEffect } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get, cloneDeep } from 'lodash';
import {
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiButtonIcon,
  EuiToolTip,
  EuiLoadingSpinner,
  EuiEmptyPrompt,
  EuiButton,
} from '@elastic/eui';
import {
  checksText,
  executeText,
  deleteText,
  executeBlocksAboveAndThisBlockText,
  executeOnlyThisBlockText,
  looksLikeYouDontHaveAnyCheckText,
  addText,
} from '../../../../utils/i18n/watch';
import { WatchService } from '../../../../services';
import { formikToWatch } from '../../utils';
import { stringifyPretty } from '../../../../utils/helpers';

import { StaticBlock, SearchBlock, HttpBlock } from './utils/Blocks';
import { StaticBlockForm, ScriptBlockForm, SearchBlockForm, HttpBlockForm } from './Forms';

import { Context } from '../../../../Context';

const BlocksWatch = ({
  checksBlocksPath,
  droppableId,
  draggableId,
  onAddTemplate,
  onCloseResult,
  formik: { values, setFieldValue },
}) => {
  const { httpClient, addErrorToast, triggerConfirmModal } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);

  const watchService = new WatchService(httpClient);
  const blocks = get(values, checksBlocksPath, []);

  useEffect(() => {
    onCloseResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragEnd = ({ source, destination }) => {
    if (source && destination) {
      const newBlocks = cloneDeep(blocks);
      const [removed] = newBlocks.splice(source.index, 1);
      newBlocks.splice(destination.index, 0, removed);
      setFieldValue(checksBlocksPath, newBlocks);
    }
  };

  const deleteBlock = index => {
    triggerConfirmModal({
      body: <p>{deleteText}?</p>,
      onConfirm: () => {
        const newBlocks = cloneDeep(blocks);
        newBlocks.splice(index, 1);
        setFieldValue(checksBlocksPath, newBlocks);
        triggerConfirmModal(null);
      },
      onCancel: () => {
        triggerConfirmModal(null);
      },
    });
  };

  const executeBlocks = async (startIndex, endIndex) => {
    console.debug('BlocksWatch -- executeBlocks -- prev values', values);
    const newFormikValues = cloneDeep({
      ...values,
      _ui: { ...values._ui, checksBlocks: blocks.slice(startIndex, endIndex + 1) },
    });

    setIsLoading(true);

    try {
      console.debug('BlocksWatch -- executeBlocks -- current values', newFormikValues);
      const { ok, resp } = await watchService.execute({ watch: formikToWatch(newFormikValues) });
      setFieldValue(`${checksBlocksPath}.${endIndex}.response`, stringifyPretty(resp));

      if (!ok) throw resp;
    } catch (error) {
      console.error('BlocksWatch -- executeBlocks', error);
      addErrorToast(error);
    }

    setIsLoading(false);
  };

  const renderActions = idx => (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiToolTip content={executeBlocksAboveAndThisBlockText} title={executeText}>
          {isLoading ? (
            <EuiLoadingSpinner size="m" />
          ) : (
            <EuiButtonIcon
              aria-label="execute-cascade"
              data-test-subj={`sgBlocks-execute-cascade-block-${idx}`}
              iconType="play"
              onClick={() => executeBlocks(0, idx)}
            />
          )}
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiToolTip content={executeOnlyThisBlockText} title={executeText}>
          {isLoading ? (
            <EuiLoadingSpinner size="m" />
          ) : (
            <EuiButtonIcon
              aria-label="execute"
              data-test-subj={`sgBlocks-execute-single-block-${idx}`}
              iconType="bullseye"
              onClick={() => executeBlocks(idx, idx)}
            />
          )}
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiToolTip title={deleteText}>
          {isLoading ? (
            <EuiLoadingSpinner size="m" />
          ) : (
            <EuiButtonIcon
              aria-label="delete"
              data-test-subj={`sgBlocks-delete-block-${idx}`}
              iconType="trash"
              color="danger"
              onClick={() => deleteBlock(idx)}
            />
          )}
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const renderBlockForm = ({ block, idx }) => {
    let form;

    switch (block.type) {
      case StaticBlock.type:
        form = <StaticBlockForm idx={idx} block={block} checksBlocksPath={checksBlocksPath} />;
        break;
      case SearchBlock.type:
        form = <SearchBlockForm idx={idx} block={block} checksBlocksPath={checksBlocksPath} />;
        break;
      case HttpBlock.type:
        form = <HttpBlockForm idx={idx} block={block} checksBlocksPath={checksBlocksPath} />;
        break;
      default:
        form = <ScriptBlockForm idx={idx} block={block} checksBlocksPath={checksBlocksPath} />;
        break;
    }

    return form;
  };

  const renderBlocks = () => {
    return blocks.map((block, idx) => (
      <EuiDraggable
        spacing="m"
        key={block.id}
        index={idx}
        draggableId={`${draggableId}-${block.id}`}
        customDragHandle={true}
      >
        {(provided, state) => (
          <EuiPanel hasShadow={state.isDragging}>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <div
                  {...provided.dragHandleProps}
                  data-test-subject={`sgBlocks-grab-block-${block.id}`}
                >
                  <EuiIcon type="grab" />
                </div>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiAccordion
                  buttonContent={block.name || block.type}
                  id={`${draggableId}-accordion-block-${block.id}`}
                  extraAction={renderActions(idx)}
                >
                  <div>
                    <EuiSpacer />
                    {renderBlockForm({ idx, block })}
                  </div>
                </EuiAccordion>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        )}
      </EuiDraggable>
    ));
  };

  const renderEmptyPrompt = () => (
    <EuiEmptyPrompt
      body={<p>{looksLikeYouDontHaveAnyCheckText}</p>}
      actions={
        <EuiButton data-test-subj={`sgBlocks-emptyPrompt-add-block`} onClick={onAddTemplate}>
          {addText}
        </EuiButton>
      }
    />
  );

  return (
    <div style={{ overflowX: 'hidden' }}>
      <EuiDragDropContext onDragEnd={onDragEnd}>
        <EuiPanel paddingSize="s">
          <EuiTitle size="xs">
            <h3>{checksText}</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiDroppable droppableId={droppableId} spacing="m">
            {blocks.length ? renderBlocks() : renderEmptyPrompt()}
          </EuiDroppable>
        </EuiPanel>
      </EuiDragDropContext>
    </div>
  );
};

BlocksWatch.defaultProps = {
  // Can accept any check blocks path, for example, action check blocks
  checksBlocksPath: '_ui.checksBlocks',
  // Must be unique on a single page
  droppableId: 'sgBlocks-checksBlocks-droppable',
  draggableId: 'sgBlocks-checksBlocks-draggable',
};

BlocksWatch.propTypes = {
  checksBlocksPath: PropTypes.string,
  droppableId: PropTypes.string,
  formik: PropTypes.object.isRequired,
  onAddTemplate: PropTypes.func.isRequired,
  onCloseResult: PropTypes.func.isRequired,
};

export default connectFormik(BlocksWatch);
