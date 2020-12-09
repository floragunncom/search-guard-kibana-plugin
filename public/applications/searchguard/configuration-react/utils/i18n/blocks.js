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
import { EuiI18n, EuiLink } from '@elastic/eui';

export const blocksText = <EuiI18n token="sg.blocks.blocks.text" default="Blocks" />;
export const blocksDescriptionText = (
  <EuiI18n token="sg.blocks.blocksDescription.text" default="Blocking users and IP addresses." />
);
export const blocksDescriptionContentPanelText = (
  <>
    <EuiI18n
      token="sg.blocks.blocksDescription.text"
      default="Blocking users and IP addresses. The blocks are read-only to avoid cutting off the connection by accident. To create, update, and delete blocks, use "
    />
    <EuiLink target="_blank" href="https://docs.search-guard.com/latest/rest-api-blocks">
      API
    </EuiLink>
  </>
);
export const typeText = <EuiI18n token="sg.blocks.type.text" default="Type" />;
export const valueText = <EuiI18n token="sg.blocks.value.text" default="Value" />;
export const verdictText = <EuiI18n token="sg.blocks.verdict.text" default="Verdict" />;
export const noBlocksText = <EuiI18n token="sg.blocks.noBlocks.text" default="No Blocks" />;
