import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiTitle,
  EuiLoadingKibana
} from '@elastic/eui';

const handleRenderActions = actions => (
  Array.isArray(actions) ? (
    actions.map((action, i) => <EuiFlexItem key={i}>{action}</EuiFlexItem>)
  ) : (
    <EuiFlexItem>{actions}</EuiFlexItem>
  )
);

const loadingPageData = (
  <EuiFlexGroup justifyContent="spaceAround">
    <EuiFlexItem grow={false}>
      <EuiLoadingKibana size="xl" />
    </EuiFlexItem>
  </EuiFlexGroup>
);

const ContentPanel = ({
  title,
  titleSize = 's',
  horizontalRuleMargin = 's',
  bodyStyles = {},
  panelStyles = {},
  headerStyles = {},
  actions,
  children,
  isLoading = false
}) => (
  <div style={{ ...panelStyles }} className="sgContentPanel">
    <EuiFlexGroup style={{ ...headerStyles }} className="sgContentPanel__header" justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem>
        <EuiTitle size={titleSize}>
          <h2>{title}</h2>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {handleRenderActions(actions)}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiHorizontalRule margin={horizontalRuleMargin} />

    {isLoading ? loadingPageData : (<div style={{ ...bodyStyles }} className="sgContentPanel__body">{children}</div>)}
  </div>
);

ContentPanel.propTypes = {
  title: PropTypes.node,
  titleSize: PropTypes.string,
  bodyStyles: PropTypes.object,
  panelStyles: PropTypes.object,
  headerStyles: PropTypes.object,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]).isRequired,
  isLoading: PropTypes.bool
};

export default ContentPanel;
