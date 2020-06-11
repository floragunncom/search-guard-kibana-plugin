/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState, useContext, useEffect } from 'react';
import { get } from 'lodash';
import { connect as connectFormik } from 'formik';
import DraggableList from 'react-draggable-list';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { EuiSpacer, EuiCodeEditor, EuiFormRow, EuiText, EuiLink } from '@elastic/eui';
import { EmptyPrompt } from '../../../../../components';
import { WatchService } from '../../../../services';
import { formikToWatch } from '../../utils';
import { stringifyPretty } from '../../../../utils/helpers';
import {
  looksLikeYouDontHaveAnyCheckText,
  noChecksText,
  responseText,
  closeText,
} from '../../../../utils/i18n/watch';
import QueryStat from '../QueryStat';
import Block from './Block';

import { Context } from '../../../../Context';

import './styles.css';

const BlocksWatch = ({
  formik: { values, setFieldValue },
  isResultVisible,
  editorResult,
  onCloseResult,
  onOpenChecksTemplatesFlyout,
}) => {
  const { editorTheme, httpClient, triggerConfirmDeletionModal, addErrorToast } = useContext(
    Context
  );

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    onCloseResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checksBlocks = get(values, '_ui.checksBlocks', []);
  const watchService = new WatchService(httpClient);

  const setBlocks = reorderedChecks => {
    setFieldValue('_ui.checksBlocks', reorderedChecks);
  };

  const deleteBlock = index => {
    const newChecks = update(checksBlocks, { $splice: [[index, 1]] });

    triggerConfirmDeletionModal({
      body: 'the check',
      onConfirm: () => {
        setFieldValue('_ui.checksBlocks', newChecks);
        triggerConfirmDeletionModal(null);
      },
    });
  };

  const executeBlocks = async (startIndex, endIndex) => {
    console.debug('BlocksWatch -- executeBlocks -- prev values', values);
    const newFormikValues = update(values, {
      _ui: { checksBlocks: { $set: checksBlocks.slice(startIndex, endIndex + 1) } },
    });

    setLoading(true);

    try {
      console.debug('BlocksWatch -- executeBlocks -- current values', newFormikValues);
      const { ok, resp } = await watchService.execute({ watch: formikToWatch(newFormikValues) });
      setFieldValue(`_ui.checksBlocks.${endIndex}.response`, stringifyPretty(resp));

      if (!ok) throw resp;
    } catch (error) {
      console.error('BlocksWatch -- executeBlocks', error);
      addErrorToast(error);
    }

    setLoading(false);
  };

  const renderWatchResponse = () => (
    <>
      <EuiSpacer />
      <EuiFormRow
        fullWidth
        label={responseText}
        labelAppend={
          <EuiText size="xs" onClick={onCloseResult}>
            <EuiLink id="close-response" data-test-subj="sgWatch-CloseResponse">
              {closeText} X
            </EuiLink>
          </EuiText>
        }
      >
        <EuiCodeEditor
          theme={editorTheme}
          mode="json"
          width="100%"
          height="500px"
          value={editorResult}
          readOnly
        />
      </EuiFormRow>
      <EuiSpacer />
      <QueryStat />
    </>
  );

  return (
    <div>
      {isResultVisible && renderWatchResponse()}
      <div className="blocksWatch-blocks-list">
        <DraggableList
          itemKey="index"
          template={Block}
          // The 'index' prop must be recalculated because
          // react-draggable-list maintains its own state of items
          list={checksBlocks.map((block, index) => ({ ...block, index }))}
          onMoveEnd={reorderedChecks => setBlocks(reorderedChecks)}
          container={() => document.body}
          // The common props are used by Block
          commonProps={{
            isLoading,
            onDeleteBlock: deleteBlock,
            onExecuteBlocks: (startIndex, endIndex) => executeBlocks(startIndex, endIndex),
          }}
        />
      </div>

      {!checksBlocks.length && (
        <EmptyPrompt
          titleText={noChecksText}
          bodyText={looksLikeYouDontHaveAnyCheckText}
          onCreate={onOpenChecksTemplatesFlyout}
        />
      )}
    </div>
  );
};

BlocksWatch.propTypes = {
  formik: PropTypes.object.isRequired,
  onCloseResult: PropTypes.func.isRequired,
  editorResult: PropTypes.string,
  isResultVisible: PropTypes.bool,
  onOpenChecksTemplatesFlyout: PropTypes.func.isRequired,
};

export default connectFormik(BlocksWatch);
