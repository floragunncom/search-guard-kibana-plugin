/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
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

const watchExamples = buildWatchExamples();

export const TabContent = ({ watchName, onPutWatch, isLoading, editorOptions, editorTheme }) => {
  let watchJson;
  try {
    watchJson = stringifyPretty(watchExamples[watchName].json);
  } catch (error) {
    watchJson = error.toString();
  }

  const addJsonWatchText = <p>{addText} JSON</p>;
  const addGraphWatchText = <p>{addText} Graph</p>;

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
          setOptions={editorOptions}
          mode="json"
          width="100%"
          value={watchJson}
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
  isLoading: PropTypes.bool.isRequired,
  editorOptions: PropTypes.object,
  editorTheme: PropTypes.string,
};

const renderTabs = ({ onPutWatch, isLoading, editorOptions, editorTheme }) =>
  Object.values(WATCH_EXAMPLES).reduce((acc, watchName) => {
    acc.push({
      id: watchName,
      name: startCase(watchName),
      content: (
        <TabContent
          watchName={watchName}
          onPutWatch={onPutWatch}
          isLoading={isLoading}
          editorOptions={editorOptions}
          editorTheme={editorTheme}
        />
      ),
    });
    return acc;
  }, []);

export const watchesHelp = ({
  title = watchExamplesText,
  flyoutProps = { size: 'l' },
  headerProps = { hasBorder: true },
  onPutWatch,
  isLoading,
  error,
  editorTheme,
  editorOptions,
} = {}) => {
  const tabs = renderTabs({ onPutWatch, isLoading, editorOptions, editorTheme });

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
        <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
      </div>
    ),
  };
};

watchesHelp.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  flyoutProps: PropTypes.object,
  headerProps: PropTypes.object,
  onPutWatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  editorOptions: PropTypes.object,
  editorTheme: PropTypes.string,
};
