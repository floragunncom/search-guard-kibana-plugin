import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSuperDatePicker,
  EuiSwitch,
  EuiSpacer
} from '@elastic/eui';
import PropTypes from 'prop-types';

export default class DatePicker extends Component {

  state = {
    recentlyUsedRanges: [],
    isLoading: false,
    showUpdateButton: true,
    isAutoRefreshOnly: false,
  }

  onTimeChange = ({ start, end }) => {
    this.setState((prevState) => {
      const recentlyUsedRanges = prevState.recentlyUsedRanges.filter(recentlyUsedRange => {
        const isDuplicate = recentlyUsedRange.start === start && recentlyUsedRange.end === end;
        return !isDuplicate;
      });
      recentlyUsedRanges.unshift({ start, end });
      return {
        recentlyUsedRanges: recentlyUsedRanges.length > 10 ? recentlyUsedRanges.slice(0, 9) : recentlyUsedRanges,
        isLoading: true,
      };
    }, this.startLoading);
    this.props.fetchDocs({ start, end });
  }

  onRefresh = ({ start, end, refreshInterval }) => {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    }).then(() => {
      console.log(start, end, refreshInterval);
      this.props.fetchDocs();
    });
  }

  onStartInputChange = e => {
    this.props.fetchDocs({ start: e.target.value, end: this.props.end });
  };

  onEndInputChange = e => {
    this.props.fetchDocs({ end: e.target.value, start: this.props.start });
  };

  startLoading = () => {
    setTimeout(
      this.stopLoading,
      1000);
  }

  stopLoading = () => {
    this.setState({ isLoading: false });
  }

  onRefreshChange = ({ isPaused, refreshInterval }) => {
    this.setState({
      isPaused,
      refreshInterval,
    });
  }

  toggleShowApplyButton = () => {
    this.setState(prevState => ({
      showUpdateButton: !prevState.showUpdateButton,
    }));
  }

  toggleShowRefreshOnly = () => {
    this.setState(prevState => ({
      isAutoRefreshOnly: !prevState.isAutoRefreshOnly,
    }));
  }

  render() {
    const { start, end } = this.props;

    return (
      <EuiSuperDatePicker
        isLoading={this.state.isLoading}
        start={start}
        end={end}
        onTimeChange={this.onTimeChange}
        onRefresh={this.onRefresh}
        isPaused={this.state.isPaused}
        refreshInterval={this.state.refreshInterval}
        onRefreshChange={this.onRefreshChange}
        recentlyUsedRanges={this.state.recentlyUsedRanges}
        showUpdateButton={this.state.showUpdateButton}
        isAutoRefreshOnly={this.state.isAutoRefreshOnly}
      />
    );
  }
}

DatePicker.propTypes = {
  fetchDocs: PropTypes.func.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
};
