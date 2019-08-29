import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiTitle,
  EuiPanel,
  EuiTextColor
} from '@elastic/eui';
import LoadingPage from '../Page/LoadingPage';

const handleRenderActions = actions => (
  Array.isArray(actions) ? (
    actions.map((action, i) => <EuiFlexItem key={i}>{action}</EuiFlexItem>)
  ) : (
    <EuiFlexItem>{actions}</EuiFlexItem>
  )
);

const handleRenderSecondTitle = (secondTitle, secondTitleProps) => (
  <EuiFlexItem>
    <EuiTitle size="s" {...secondTitleProps}>
      <h4>
        <EuiTextColor color="secondary">{secondTitle}</EuiTextColor>
      </h4>
    </EuiTitle>
  </EuiFlexItem>
);

const ContentPanel = ({
  title,
  secondTitle,
  titleProps,
  secondTitleProps,
  horizontalRuleProps,
  bodyStyles,
  panelProps,
  headerStyles,
  actions,
  children,
  isLoading
}) => (
  <EuiPanel paddingSize="l" {...panelProps} className="sgContentPanel">
    <EuiFlexGroup
      style={{ padding: '0px 10px', ...headerStyles }}
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem>
        <EuiTitle size="s" {...titleProps}>
          <h2>{title}</h2>
        </EuiTitle>
        {secondTitle && handleRenderSecondTitle(secondTitle, secondTitleProps)}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {handleRenderActions(actions)}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiHorizontalRule margin="s" {...horizontalRuleProps} />
    {isLoading ? LoadingPage : <div style={{ padding: '0px 10px', ...bodyStyles }}>{children}</div>}
  </EuiPanel>
);

ContentPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  titleProps: PropTypes.object,
  secondTitle: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  secondTitleProps: PropTypes.object,
  bodyStyles: PropTypes.object,
  panelProps: PropTypes.object,
  horizontalRuleProps: PropTypes.object,
  headerStyles: PropTypes.object,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]).isRequired,
  isLoading: PropTypes.bool
};

ContentPanel.defaultProps = {
  titleProps: {},
  secondTitleProps: {},
  horizontalRuleProps: {},
  bodyStyles: {},
  panelProps: {},
  headerStyles: {},
  isLoading: false
};

export default ContentPanel;
