import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiCallOut,
  EuiTitle,
  EuiTabbedContent,
  EuiSpacer,
  EuiFormRow,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSideNav
} from '@elastic/eui';
import { startCase } from 'lodash';
import { AddButton, LabelAppendLink } from '../../../../../components';
import {
  stringifyPretty,
  unfoldMultiLineString,
  foldMultiLineString,
} from '../../../../utils/helpers';
import { checkExamplesText } from '../../../../utils/i18n/watch';
import examples from './utils/examples';

export const TabContent = ({ examples, tabName, onAdd }) => {
  const [isSideNavOpenOnMobile, setSideNavOpenOnMobile] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState(null);

  useEffect(() => {
    setSelectedItemName(Object.keys(examples)[0]);
  }, [tabName]);

  const toggleOpenOnMobile = () => {
    setSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const createNavItem = (name, data = {}) => ({
    ...data,
    id: name,
    name: startCase(name),
    isSelected: selectedItemName === name,
    onClick: () => setSelectedItemName(name)
  });

  const handleOnAdd = (body, type) => {
    // const normalizedBody = JSON.parse(foldMultiLineString(JSON.stringify(body))); 

    const newCheck = type
      ? body
      : {
        type: 'search',
        name: 'mysearch',
        target: 'mysearch',
        request: {
          indices: [],
          body,
        },
      };

    onAdd(newCheck);
  };

  const buildSideNav = (data = {}) => Object.keys(data)
    .map(categoryName => createNavItem(categoryName));

  const renderExamples = () => {
    if (!examples[selectedItemName]) return null;
  
    return Object.keys(examples[selectedItemName]).map(subItemName => {
      const { example, link, type } = examples[selectedItemName][subItemName];
      return (
        <div key={subItemName}>
          <EuiFormRow
            fullWidth
            label={startCase(subItemName)}
            labelAppend={<LabelAppendLink href={link} name={`CheckExample-${subItemName}`} />}
          >
            <EuiCodeBlock
              language="json"
              data-test-subj={`sgCodeBlock-CheckExample-${subItemName}`}
            >
              {unfoldMultiLineString(stringifyPretty(example))}
            </EuiCodeBlock>
          </EuiFormRow>
          <AddButton
            onClick={() => handleOnAdd(example, type)}
            name={`CheckExample-${subItemName}`}
          />
          <EuiSpacer />
        </div>
      );
    });
  };

  return (
    <Fragment> 
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiSideNav
            mobileTitle="Navigate examples"
            toggleOpenOnMobile={toggleOpenOnMobile}
            isOpenOnMobile={isSideNavOpenOnMobile}
            items={buildSideNav(examples)}
            style={{ width: 192 }}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          {renderExamples()}
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment> 
  );
};

TabContent.propTypes = {
  onAdd: PropTypes.func.isRequired,
  tabName: PropTypes.string.isRequired,
  examples: PropTypes.object.isRequired
};

export const checkExamples = ({
  flyoutProps,
  headerProps,
  onAdd,
  error
}) => {
  const tabs = Object.keys(examples).map(name => ({
    id: name,
    name: startCase(name.replace(/Examples/, '')),
    content: <TabContent examples={examples[name]} tabName={name} onAdd={onAdd} />
  }));

  return {
    flyoutProps,
    headerProps,
    header: (
      <EuiTitle>
        <h2 id="flyoutTitle">{checkExamplesText}</h2>
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
}

checkExamples.propTypes = {
  flyoutProps: PropTypes.object,
  headerProps: PropTypes.object,
  onAdd: PropTypes.func.isRequired,
  error: PropTypes.object
};

checkExamples.defaultProps = {
  flyoutProps: { size: 'l' },
  headerProps: { hasBorder: true }  
};
