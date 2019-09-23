import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiTabbedContent,
  EuiSpacer,
  EuiFormRow,
  EuiCodeBlock,
} from '@elastic/eui';
import { startCase, map, includes } from 'lodash';
import { helpText } from '../../../../utils/i18n/common';
import templates from './utils/templates';
import { AddButton, LabelAppendLink } from '../../../../../components';
import { QUERIES } from './utils/constants';

const ChecksHelpFlyout = ({ onClose, onAdd }) => {
  const addCheckTemplate = (template, type) => {
    let newCheck = {
      type: 'search',
      name: 'newsearch',
      target: 'newsearch',
      request: {
        indices: [],
        body: JSON.parse(template)
      }
    };

    if (includes(type, 'condition')) {
      newCheck = JSON.parse(template);
    }

    onAdd(newCheck);
  };

  const renderTemplates = category =>
    map(templates[category], ({ example, link, type }, name) => (
      <div key={name}>
        <EuiSpacer />
        <EuiFormRow
          label={startCase(name)}
          labelAppend={<LabelAppendLink href={link} name={`CheckExample-${name}`} />}
        >
          <EuiCodeBlock
            language="json"
            data-test-subj={`sgCodeBlock-CheckExample-${name}`}
          >
            {example}
          </EuiCodeBlock>
        </EuiFormRow>
        <AddButton
          onClick={() => addCheckTemplate(example, type)}
          name={`CheckExample-${name}`}
        />
      </div>
    ));

  const [tabs] = useState(
    Object.values(QUERIES).reduce((acc, queryName) => {
      acc.push({
        id: queryName,
        name: startCase(queryName),
        content: renderTemplates(queryName),
      });
      return acc;
    }, []),
  );

  return (
    <EuiFlyout size="l" onClose={onClose}>
      <EuiFlyoutHeader size="m" hasBorder>
        <EuiTitle>
          <h2 id="flyoutTitle">{helpText}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiTabbedContent
          tabs={tabs}
          initialSelectedTab={tabs[0]}
        />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

ChecksHelpFlyout.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default ChecksHelpFlyout;
