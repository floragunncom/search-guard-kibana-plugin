/* eslint-disable @kbn/eslint/require-license-header */
/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright 2015-2019 _floragunn_ GmbH
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
import { EuiHealth, EuiHighlight } from '@elastic/eui';

import { FormikComboBox } from '../../../../components';
import { validateIndex, hasError, isInvalid } from '../../utils/validate';
import {
  canAppendWildcard,
  createReasonableWait,
  getMatchedOptions,
  aliasesToUiAliases,
  indicesToUiIndices,
} from './utils/helpers';
import { ElasticsearchService } from '../../../../services';
import {
  indexText,
  putAsteriskToQueryIndicesUsingWildcardText,
} from '../../../../utils/i18n/watch';

import { Context } from '../../../../Context';

const CustomOption = ({ option, searchValue, contentClassName }) => {
  const { health, label } = option;
  const healthToColor = {
    green: 'success',
    yellow: 'warning',
    red: 'danger',
    undefined: 'subdued',
  };
  const color = healthToColor[health];
  return (
    <EuiHealth color={color}>
      <span className={contentClassName}>
        <EuiHighlight search={searchValue}>{label}</EuiHighlight>
      </span>
    </EuiHealth>
  );
};

const propTypes = {
  httpClient: PropTypes.func.isRequired,
  indexFieldName: PropTypes.string.isRequired,
  isClearable: PropTypes.bool,
  singleSelection: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
};

class WatchIndex extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.lastQuery = null;
    this.state = {
      isLoading: false,
      appendedWildcard: false,
      showingIndexPatternQueryErrors: false,
      options: [],
      allIndices: [],
      partialMatchedIndices: [],
      exactMatchedIndices: [],
      allAliases: [],
      partialMatchedAliases: [],
      exactMatchedAliases: [],
    };

    this.onCreateOption = this.onCreateOption.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.handleQueryIndices = this.handleQueryIndices.bind(this);
    this.handleQueryAliases = this.handleQueryAliases.bind(this);
    this.onFetch = this.onFetch.bind(this);

    this.elasticsearchService = new ElasticsearchService(this.props.httpClient);
  }

  componentDidMount() {
    // Simulate initial load.
    this.onSearchChange('');
  }

  onCreateOption(searchValue, fieldName, selectedOptions, setFieldValue) {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) return;
    const newOption = { label: searchValue };
    setFieldValue(fieldName, selectedOptions.concat(newOption));
  }

  async onSearchChange(searchValue) {
    const { appendedWildcard } = this.state;
    let query = searchValue;
    if (query.length === 1 && canAppendWildcard(query)) {
      query += '*';
      this.setState({ appendedWildcard: true });
    } else {
      if (query === '*' && appendedWildcard) {
        query = '';
        this.setState({ appendedWildcard: false });
      }
    }

    this.lastQuery = query;
    this.setState({ query, showingIndexPatternQueryErrors: !!query.length });

    await this.onFetch(query);
  }

  async handleQueryIndices(rawIndex) {
    const index = rawIndex.trim();

    // Searching for `*:` fails for CCS environments. The search request
    // is worthless anyways as the we should only send a request
    // for a specific query (where we do not append *) if there is at
    // least a single character being searched for.
    if (index === '*:') {
      return [];
    }

    // This should never match anything so do not bother
    if (index === '') {
      return [];
    }

    try {
      const { resp = [] } = await this.elasticsearchService.getIndices(index);
      return indicesToUiIndices(resp);
    } catch (err) {
      console.error('WatchIndex -- handleQueryIndices', err);
      this.context.addErrorToast(err);
      console.debug('WatchIndex -- index', index);
      return [];
    }
  }

  async handleQueryAliases(rawAlias) {
    const alias = rawAlias.trim();

    if (alias === '*:') {
      return [];
    }

    if (alias === '') {
      return [];
    }

    try {
      const { resp = [] } = await this.elasticsearchService.getAliases(alias);
      return aliasesToUiAliases(resp);
    } catch (err) {
      console.error('WatchIndex -- handleQueryAliases', err);
      this.context.addErrorToast(err);
      console.debug('WatchIndex -- alias', alias);
      return [];
    }
  }

  async onFetch(query) {
    this.setState({ isLoading: true, indexPatternExists: false });
    if (query.endsWith('*')) {
      const exactMatchedIndices = await this.handleQueryIndices(query);
      const exactMatchedAliases = await this.handleQueryAliases(query);
      createReasonableWait(() => {
        // If the search changed, discard this state
        if (query !== this.lastQuery) {
          return;
        }
        this.setState({ exactMatchedIndices, exactMatchedAliases, isLoading: false });
      });
    } else {
      const partialMatchedIndices = await this.handleQueryIndices(`${query}*`);
      const exactMatchedIndices = await this.handleQueryIndices(query);
      const partialMatchedAliases = await this.handleQueryAliases(`${query}*`);
      const exactMatchedAliases = await this.handleQueryAliases(query);
      createReasonableWait(() => {
        // If the search changed, discard this state
        if (query !== this.lastQuery) {
          return;
        }

        this.setState({
          partialMatchedIndices,
          exactMatchedIndices,
          partialMatchedAliases,
          exactMatchedAliases,
          isLoading: false,
        });
      });
    }
  }

  renderOption(option, searchValue, contentClassName) {
    return (
      <CustomOption option={option} searchValue={searchValue} contentClassName={contentClassName} />
    );
  }

  render() {
    const {
      isLoading,
      allIndices,
      partialMatchedIndices,
      exactMatchedIndices,
      allAliases,
      partialMatchedAliases,
      exactMatchedAliases,
    } = this.state;

    const { visibleOptions } = getMatchedOptions(
      allIndices, //all indices
      partialMatchedIndices,
      exactMatchedIndices,
      allAliases,
      partialMatchedAliases,
      exactMatchedAliases,
      false //isIncludingSystemIndices
    );

    const {
      indexFieldName,
      isClearable = true,
      singleSelection = false,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
    } = this.props;

    return (
      <FormikComboBox
        name={indexFieldName}
        formRow
        formikFieldProps={{ validate: validateIndex }}
        rowProps={{
          label: indexText,
          helpText: putAsteriskToQueryIndicesUsingWildcardText,
          isInvalid,
          error: hasError,
          style: { paddingLeft: '0px' },
        }}
        elementProps={{
          isClearable,
          singleSelection,
          placeholder: 'Select indices',
          async: true,
          isLoading,
          options: visibleOptions,
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption(),
          onSearchChange: this.onSearchChange,
          renderOption: this.renderOption,
          'data-test-subj': 'sgIndicesComboBox',
        }}
      />
    );
  }
}

WatchIndex.propTypes = propTypes;

export default WatchIndex;
