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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Hint,
  XAxis,
  YAxis,
  LineSeries,
  FlexibleXYPlot,
  LineMarkSeries,
  DiscreteColorLegend
} from 'react-vis';
import {
  getLeftPadding,
  getYTitle,
  getXDomain,
  getYDomain,
  formatYAxisTick,
  getAnnotationData,
  getDataFromResponse,
  getAggregationTitle,
  isGraphDataEmpty,
} from './utils/helpers';
import {
  ANNOTATION_STYLES,
  HINT_STYLES,
  LINE_STYLES,
  HOVERED_LINE_STYLES,
  DEFAULT_MARK_SIZE
} from './utils/constants';

export default class VisualGraph extends Component {
  static defaultProps = { annotation: false };

  state = {
    hint: null,
    hoveredLineSeriesName: null
  };

  onNearestXY = hint => {
    this.setState({ hint });
  };

  onLegendItemMouseEnter = hoveredLineSeriesName => {
    this.setState({ hoveredLineSeriesName });
  };

  resetHint = () => {
    this.setState({ hint: null });
  };

  renderXYPlot = data => {
    const { annotation, thresholdValue, values } = this.props;
    const { hint, hoveredLineSeriesName } = this.state;

    const getLineSeriesStyle = lineSeriesName => lineSeriesName === hoveredLineSeriesName
      ? HOVERED_LINE_STYLES
      : LINE_STYLES;

    const getXYDomains = data => {
      let xDomain = [];
      let yDomain = [];

      Object.keys(data).forEach(bucketsName => {
        xDomain = xDomain.concat(getXDomain(data[bucketsName]));
        yDomain = yDomain.concat(getYDomain(data[bucketsName]));
      });

      xDomain = xDomain.sort((x, y) => x - y);
      yDomain = yDomain.sort((x, y) => x - y);

      return {
        xDomain: [xDomain[0], xDomain[xDomain.length - 1]],
        yDomain: [yDomain[0], yDomain[yDomain.length - 1]]
      };
    };

    const { xDomain, yDomain } = getXYDomains(data);
    const annotations = getAnnotationData(xDomain, yDomain, thresholdValue);
    const xTitle = values._ui.timeField;
    const yTitle = getYTitle(values);
    const leftPadding = getLeftPadding(yDomain);
    const aggregationTitle = getAggregationTitle(values);

    const legendItems = Object.keys(data).map((bucketsName, key) => {
      if (bucketsName === hoveredLineSeriesName) {
        return (
          <div key={key}>
            <p><b>{bucketsName}</b></p>
          </div>
        );
      }
      return bucketsName;
    });

    return (
      <>
        <FlexibleXYPlot
          height={400}
          xType="time"
          margin={{ top: 20, right: 20, bottom: 70, left: leftPadding }}
          xDomain={xDomain}
          yDomain={yDomain}
          onMouseLeave={this.resetHint}
        >
          <XAxis title={xTitle} />
          <XAxis
            title={aggregationTitle}
            position="middle"
            orientation="top"
            tickTotal={0}
            top={-25}
            style={{ strokeWidth: '0px' }}
          />
          <YAxis title={yTitle} tickFormat={formatYAxisTick} />
          {Object.keys(data).map((bucketsName, key) => (
            <LineMarkSeries
              key={key}
              style={getLineSeriesStyle(bucketsName)}
              size={DEFAULT_MARK_SIZE}
              data={data[bucketsName]}
              onNearestXY={this.onNearestXY}
            />
          ))}
          {annotation && <LineSeries data={annotations} style={ANNOTATION_STYLES} />}
          {hint && (
            <Hint value={hint}>
              <div style={HINT_STYLES}>({hint.y.toLocaleString()})</div>
            </Hint>
          )}
        </FlexibleXYPlot>
        <DiscreteColorLegend
          orientation="horizontal"
          onItemMouseEnter={this.onLegendItemMouseEnter}
          onItemMouseLeave={() => this.onLegendItemMouseEnter(null)}
          items={legendItems}
        />
      </>
    );
  };

  renderEmptyData = () => (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '450px' }}
    >
      <div>There is no data for the current selections.</div>
    </div>
  );

  render() {
    const { response } = this.props;
    const data = getDataFromResponse(response);

    return (
      <div style={{ padding: '20px', border: '1px solid #D9D9D9', borderRadius: '5px' }}>
        {!isGraphDataEmpty(data) ? this.renderXYPlot(data) : this.renderEmptyData()}
      </div>
    );
  }
}

VisualGraph.propTypes = {
  response: PropTypes.object,
  annotation: PropTypes.bool.isRequired,
  thresholdValue: PropTypes.number,
  values: PropTypes.object.isRequired,
};
