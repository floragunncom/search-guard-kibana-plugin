import React, { useState } from 'react';
import { connect as connectFormik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import DraggableList from 'react-draggable-list';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { isEmpty } from 'lodash';
import { EmptyPrompt } from '../../../../../components';
import { WatchService } from '../../../../services';
import { formikToWatch } from '../../utils';
import { stringifyPretty } from '../../../../utils/helpers';
import {
  looksLikeYouDontHaveAnyCheckText,
  noChecksText,
} from '../../../../utils/i18n/watch';
import WatchResponse from '../WatchResponse';
import { addErrorToast } from '../../../../redux/actions';
import Block from './Block';

import './styles.css';

const BlocksWatch = ({
  formik: {
    values,
    setFieldValue,
  },
  httpClient,
  onOpenChecksHelpFlyout,
  onTriggerConfirmDeletionModal,
  dispatch,
}) => {
  const [isLoading, setLoading] = useState(false);

  const { checksBlocks = [], checksResult = '' } = values._ui;
  const watchResponse = !isEmpty(checksResult) ? stringifyPretty(checksResult) : null;

  const watchService = new WatchService(httpClient);

  const setBlocks = reorderedChecks => {
    setFieldValue('_ui.checksBlocks', reorderedChecks);
  };

  const deleteBlock = index => {
    const newChecks = update(checksBlocks, {
      $splice: [[index, 1]]
    });

    onTriggerConfirmDeletionModal({
      body: 'the check',
      onConfirm: () => {
        setFieldValue('_ui.checksBlocks', newChecks);
        onTriggerConfirmDeletionModal(null);
      }
    });
  };

  const executeBlocks = async (startIndex, endIndex) => {
    const newFormikValues = update(values, {
      _ui: {
        checksBlocks: { $set: values._ui.checksBlocks.slice(startIndex, endIndex + 1) }
      }
    });

    setLoading(true);

    try {
      const { ok, resp } = await watchService.execute(formikToWatch(newFormikValues));
      setFieldValue(`_ui.checksBlocks.${endIndex}.response`, stringifyPretty(resp));
      if (!ok) throw resp;
    } catch (error) {
      console.error('BlocksWatch -- executeBlocks', error);
      dispatch(addErrorToast(error));
      console.debug('BlocksWatch -- formik values', newFormikValues);
    }

    setLoading(false);
  };

  return (
    <div>
      {!!checksResult && (
        <WatchResponse
          response={watchResponse}
          onClose={() => setFieldValue('_ui.checksResult', null)}
        />
      )}

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
          onCreate={onOpenChecksHelpFlyout}
        />
      )}
    </div>
  );
};

BlocksWatch.propTypes = {
  formik: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
  onOpenChecksHelpFlyout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connectRedux()(connectFormik(BlocksWatch));
