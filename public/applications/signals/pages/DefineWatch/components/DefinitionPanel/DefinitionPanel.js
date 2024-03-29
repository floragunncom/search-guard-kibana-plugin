/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext, useState, useEffect } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiButton, EuiSpacer, EuiErrorBoundary } from '@elastic/eui';
import { useCheckTemplates, useWatchChecks } from '../../hooks';
import { FormikSelect, ContentPanel } from '../../../../components';
import { BlocksWatch } from '../BlocksWatch';
import GraphWatch from '../GraphWatch';
import QueryStat from '../QueryStat';
import SeverityForm from '../SeverityForm';
import { FLYOUTS } from '../../../../utils/constants';
import { WATCH_TYPES_OPTIONS, WATCH_TYPES } from '../../utils/constants';
import { definitionText, typeText, executeText, addText } from '../../../../utils/i18n/common';

import { Context } from '../../../../Context';

const DefinitionPanel = ({ formik: { values, setFieldValue } }) => {
  const { httpClient, triggerFlyout } = useContext(Context);

  const watchType = get(values, '_ui.watchType', WATCH_TYPES.GRAPH);
  const isSeverity = get(values, '_ui.isSeverity', false);

  const { addTemplate } = useCheckTemplates({
    setFieldValue,
    checksPath: watchType === WATCH_TYPES.BLOCKS ? '_ui.checksBlocks' : 'checks',
  });

  const { isResultVisible, closeResult, editorResult, isLoading, executeWatch } = useWatchChecks({
    setFieldValue,
  });

  const [templateCounter, setTemplateCounter] = useState(0);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (template) {
      addTemplate({ template, values });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateCounter]);

  const addTemplateHelper = (template) => {
    setTemplate(template);
    setTemplateCounter((prevState) => prevState + 1);
  };

  const handleAddTemplate = () => {
    triggerFlyout({
      type: FLYOUTS.CHECK_EXAMPLES,
      payload: { onChange: addTemplateHelper },
    });
  };

  const addChecksBtn = (
    <EuiButton data-test-subj="sgAddButton-AddChecks" onClick={handleAddTemplate}>
      {addText}
    </EuiButton>
  );

  const execChecksBtn = (
    <EuiButton
      isLoading={isLoading}
      isDisabled={isLoading}
      data-test-subj="sgAddButton-ExecuteChecks"
      onClick={() => executeWatch({ values })}
    >
      {executeText}
    </EuiButton>
  );

  function renderSeverity() {
    return (
      <>
        <EuiSpacer />
        <SeverityForm isTitle />
      </>
    );
  }

  let contentPanleActions = [];
  let watch;

  switch (watchType) {
    case WATCH_TYPES.BLOCKS:
      contentPanleActions = [addChecksBtn, execChecksBtn];

      watch = (
        <EuiErrorBoundary>
          <EuiSpacer />
          <BlocksWatch
            checksBlocksPath="_ui.checksBlocks"
            isResultVisible={isResultVisible}
            editorResult={editorResult}
            onCloseResult={closeResult}
            onOpenChecksTemplatesFlyout={handleAddTemplate}
          />
          {isSeverity && renderSeverity()}
        </EuiErrorBoundary>
      );
      break;
    default:
      watch = (
        <EuiErrorBoundary>
          <GraphWatch isResultVisible={isResultVisible} httpClient={httpClient} />
          <QueryStat />
        </EuiErrorBoundary>
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
