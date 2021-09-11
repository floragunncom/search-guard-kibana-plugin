/* eslint-disable @osd/eslint/require-license-header */
import React, { Component } from 'react';
import { EuiSuperDatePicker, EuiErrorBoundary } from '@elastic/eui';
import PropTypes from 'prop-types';

export default class DatePicker extends Component {
  state = {
    recentlyUsedRanges: [],
    isLoading: false,
    showUpdateButton: true,
    isAutoRefreshOnly: false,
  };

  onTimeChange = ({ start, end }) => {
    const { refreshInterval, isPaused, onChange } = this.props;

    this.setState((prevState) => {
      const recentlyUsedRanges = prevState.recentlyUsedRanges.filter((recentlyUsedRange) => {
        const isDuplicate = recentlyUsedRange.start === start && recentlyUsedRange.end === end;
        return !isDuplicate;
      });
      recentlyUsedRanges.unshift({ start, end });

      return {
        recentlyUsedRanges:
          recentlyUsedRanges.length > 10 ? recentlyUsedRanges.slice(0, 9) : recentlyUsedRanges,
        isLoading: true,
      };
    }, this.startLoading);

    onChange({
      start,
      end,
      refreshInterval,
      isPaused,
    });
  };

  onRefresh = ({ start, end, refreshInterval }) => {
    const { isPaused, onChange } = this.props;

    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    }).then(() => {
      onChange({
        start,
        end,
        refreshInterval,
        isPaused,
        isRefreshingWithNoChange: true,
      });
    });
  };

  onStartInputChange = (e) => {
    const { end, refreshInterval, isPaused, onChange } = this.props;

    onChange({
      start: e.target.value,
      end,
      refreshInterval,
      isPaused,
    });
  };

  onEndInputChange = (e) => {
    const { start, refreshInterval, isPaused, onChange } = this.props;

    onChange({
      end: e.target.value,
      start,
      refreshInterval,
      isPaused,
    });
  };

  startLoading = () => {
    setTimeout(this.stopLoading, 1000);
  };

  stopLoading = () => {
    this.setState({ isLoading: false });
  };

  onRefreshChange = ({ isPaused, refreshInterval }) => {
    const { start, end, onChange } = this.props;

    onChange({
      start,
      end,
      refreshInterval,
      isPaused,
    });
  };

  toggleShowApplyButton = () => {
    this.setState((prevState) => ({
      showUpdateButton: !prevState.showUpdateButton,
    }));
  };

  toggleShowRefreshOnly = () => {
    this.setState((prevState) => ({
      isAutoRefreshOnly: !prevState.isAutoRefreshOnly,
    }));
  };

  render() {
    const { start, end, refreshInterval, isPaused } = this.props;

    return (
      <EuiErrorBoundary>
        <EuiSuperDatePicker
          isLoading={this.state.isLoading}
          start={start}
          end={end}
          onTimeChange={this.onTimeChange}
          onRefresh={this.onRefresh}
          isPaused={isPaused}
          refreshInterval={refreshInterval}
          onRefreshChange={this.onRefreshChange}
          recentlyUsedRanges={this.state.recentlyUsedRanges}
          showUpdateButton={this.state.showUpdateButton}
          isAutoRefreshOnly={this.state.isAutoRefreshOnly}
        />
      </EuiErrorBoundary>
    );
  }
}

DatePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  refreshInterval: PropTypes.number.isRequired,
  isPaused: PropTypes.bool.isRequired,
};
