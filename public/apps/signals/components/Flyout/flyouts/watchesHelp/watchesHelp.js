import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  EuiTitle,
  EuiTabbedContent,
  EuiCodeEditor,
  EuiSpacer,
  EuiFormRow,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
} from '@elastic/eui';
import { LabelAppendLink, AddButton } from '../../../';
import { startCase } from 'lodash';
import { stringifyPretty } from '../../../../utils/helpers';
import buildWatchExamples from './utils/buildWatchExamples';

import { watchExamplesText } from '../../../../utils/i18n/watch';
import { addText } from '../../../../utils/i18n/common';
import { WATCH_EXAMPLES } from '../../../../utils/constants';

import { Context } from '../../../../Context';

const watchExamples = buildWatchExamples();

export const TabContent = ({ watchName, onPutWatch, isLoading }) => {
  const { editorTheme, editorOptions } = useContext(Context);

  let watchJson;
  try {
    watchJson = stringifyPretty(watchExamples[watchName].json);
  } catch (error) {
    watchJson = error.toString();
  }

  const addJsonWatchText = (<p>{addText} JSON</p>);
  const addGraphWatchText = (<p>{addText} Graph</p>);

  return (
    <div>
      <EuiSpacer />
      <EuiFormRow
        fullWidth
        label="Watch"
        labelAppend={<LabelAppendLink href={watchExamples[watchName].doc_link} name="WatchDoc" />}
      >
        <EuiCodeEditor
          theme={editorTheme}
          width="100%"
          value={watchJson}
          setOptions={editorOptions}
          isReadOnly
          data-test-subj={`sgWatch-ExampleCode-${watchName}`}
          id={`watch-example-${watchName}`}
        />
      </EuiFormRow>

      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <AddButton
            iconType="document"
            name="JsonWatch"
            isLoading={isLoading}
            onClick={() => onPutWatch(watchExamples[watchName].json)}
            value={addJsonWatchText}
          />
        </EuiFlexItem>
        {watchExamples[watchName].graph && (
          <EuiFlexItem grow={false}>
            <AddButton
              iconType="visArea"
              name="GraphWatch"
              isLoading={isLoading}
              onClick={() => onPutWatch(watchExamples[watchName].graph)}
              value={addGraphWatchText}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </div>
  );
};

TabContent.propTypes = {
  watchName: PropTypes.string.isRequired,
  onPutWatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

const renderTabs = ({ onPutWatch, isLoading }) => Object.values(WATCH_EXAMPLES)
  .reduce((acc, watchName) => {
    acc.push({
      id: watchName,
      name: startCase(watchName),
      content: <TabContent watchName={watchName} onPutWatch={onPutWatch} isLoading={isLoading} />
    });
    return acc;
  }, []);

export const watchesHelp = ({
  title = watchExamplesText,
  flyoutProps = { size: 'l' },
  headerProps = { hasBorder: true },
  onPutWatch,
  isLoading,
  error
} = {}) => {
  const tabs = renderTabs({ onPutWatch, isLoading });

  return {
    flyoutProps,
    headerProps,
    header: (
      <EuiTitle size="m">
        <h2>{title}</h2>
      </EuiTitle>
    ),
    body: (
      <div>
        {error && (
          <EuiCallOut color="danger" iconType="alert">
            {error.message}
          </EuiCallOut>
        )}
        <EuiTabbedContent
          tabs={tabs}
          initialSelectedTab={tabs[0]}
        />
      </div>
    )
  };
};

watchesHelp.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  flyoutProps: PropTypes.object,
  headerProps: PropTypes.object,
  onPutWatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object
};
