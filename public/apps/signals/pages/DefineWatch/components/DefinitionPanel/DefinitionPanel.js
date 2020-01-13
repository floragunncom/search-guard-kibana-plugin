import React, { useContext } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import { useCheckTemplates, useJsonWatchChecks } from '../../hooks';
import { FormikSelect, ContentPanel } from '../../../../components';
import JsonWatch from '../JsonWatch';
import BlocksWatch from '../BlocksWatch';
import GraphWatch from '../GraphWatch';
import { FLYOUTS } from '../../../../utils/constants';
import { WATCH_TYPES_OPTIONS, WATCH_TYPES } from '../../utils/constants';
import { definitionText, typeText, executeText, addText } from '../../../../utils/i18n/common';

import { Context } from '../../../../Context';

const DefinitionPanel = ({ formik: { values, setFieldValue } }) => {
  const {
    httpClient,
    triggerFlyout,
    onComboBoxChange,
    onComboBoxCreateOption,
    onComboBoxOnBlur,
    triggerConfirmDeletionModal,
  } = useContext(Context);

  const { addTemplate } = useCheckTemplates({ setFieldValue });

  const {
    isResultVisible,
    closeResult,
    editorResult,
    isLoading,
    executeWatch,
  } = useJsonWatchChecks({ setFieldValue });

  const handleAddTemplate = () => {
    triggerFlyout({
      type: FLYOUTS.CHECK_EXAMPLES,
      payload: { onChange: template => addTemplate({ template, values }) },
    });
  };

  const watchType = get(values, '_ui.watchType', WATCH_TYPES.GRAPH);
  let contentPanleActions = [];
  let watch;

  switch (watchType) {
    case WATCH_TYPES.JSON:
      contentPanleActions = [
        <EuiButton data-test-subj="sgAddButton-AddChecks" onClick={handleAddTemplate}>
          {addText}
        </EuiButton>,
        <EuiButton
          isLoading={isLoading}
          isDisabled={isLoading}
          data-test-subj="sgAddButton-ExecuteChecks"
          onClick={() => executeWatch({ values })}
        >
          {executeText}
        </EuiButton>,
      ];

      watch = (
        <>
          <EuiSpacer />
          <JsonWatch
            isResultVisible={isResultVisible}
            editorResult={editorResult}
            onCloseResult={closeResult}
          />
        </>
      );
      break;
    case WATCH_TYPES.BLOCKS:
      contentPanleActions = [
        <EuiButton data-test-subj="sgAddButton-AddChecks" onClick={handleAddTemplate}>
          {addText}
        </EuiButton>,
      ];

      watch = (
        <BlocksWatch
          httpClient={httpClient}
          onTriggerConfirmDeletionModal={triggerConfirmDeletionModal}
          onOpenChecksTemplatesFlyout={handleAddTemplate}
        />
      );
      break;
    default:
      watch = (
        <GraphWatch
          httpClient={httpClient}
          onComboBoxChange={onComboBoxChange}
          onComboBoxOnBlur={onComboBoxOnBlur}
          onComboBoxCreateOption={onComboBoxCreateOption}
        />
      );
      break;
  }

  return (
    <ContentPanel title={definitionText} titleSize="s" actions={contentPanleActions}>
      <div>
        <FormikSelect
          name="_ui.watchType"
          formRow
          rowProps={{
            label: typeText,
          }}
          elementProps={{
            options: WATCH_TYPES_OPTIONS,
            onChange: (e, field, form) => {
              form.setFieldValue(field.name, e.target.value);
              form.setFieldValue('_ui.checksResult', null);
            },
          }}
        />

        {watch}
      </div>
    </ContentPanel>
  );
};

DefinitionPanel.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default connectFormik(DefinitionPanel);
