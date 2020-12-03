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
  EuiFlexGroup,
  EuiFlexItem
} from '@elastic/eui';
import { get } from 'lodash';
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
  HOVERED_ANNOTATION_STYLES,
  HINT_STYLES,
  LINE_STYLES,
  HOVERED_LINE_STYLES,
  DEFAULT_MARK_SIZE
} from './utils/constants';
import { SEVERITY_COLORS } from '../../utils/constants';

export default class VisualGraph extends Component {
  static defaultProps = { annotation: false };

  state = {
    hint: null,
    hoveredLineSeriesName: null,
    hoveredThresholdName: null
  };

  onNearestXY = hint => {
    this.setState({ hint });
  };

  onLineSeriesLegendItemMouseEnter = hoveredLineSeriesName => {
    this.setState({ hoveredLineSeriesName });
  };

  onThresholdLegendItemMouseEnter = hoveredThresholdName => {
    if (hoveredThresholdName == null) {
      this.setState({ hoveredThresholdName });
    } else {
      this.setState({ hoveredThresholdName: hoveredThresholdName.title });
    }
  };

  resetHint = () => {
    this.setState({ hint: null });
  };

  renderXYPlot = data => {
    const { annotation, values } = this.props;
    const isSeverity = get(values, '_ui.isSeverity', false);
    const thresholdValue = get(values, '_ui.thresholdValue');
    const severityThresholds = get(values, '_ui.severity.thresholds');
    const { hint, hoveredLineSeriesName, hoveredThresholdName } = this.state;

    const getLineSeriesStyle = lineSeriesName =>
      lineSeriesName === hoveredLineSeriesName
        ? HOVERED_LINE_STYLES
        : LINE_STYLES;

    const getThresholdStyle = thresholdName =>
      thresholdName === hoveredThresholdName
        ? HOVERED_ANNOTATION_STYLES
        : ANNOTATION_STYLES;

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
    const xTitle = values._ui.timeField;
    const yTitle = getYTitle(values);
    const leftPadding = getLeftPadding(yDomain);
    const aggregationTitle = getAggregationTitle(values);

    let annotations = [
      {
        data: getAnnotationData(xDomain, yDomain, thresholdValue),
        color: SEVERITY_COLORS.error,
        name: 'threshold'
      }
    ];

    if (isSeverity) {
      annotations = [];
      Object.keys(severityThresholds).forEach(name => {
        if (severityThresholds[name]) {
          annotations.push({
            data: getAnnotationData(xDomain, yDomain, severityThresholds[name]),
            color: SEVERITY_COLORS[name],
            name
          });
        }
      });
    }

    const lineSeriesLegendItems = Object.keys(data).map((name, key) => {
      if (name === hoveredLineSeriesName) {
        return (
          <div key={key}>
            <p><b>{name}</b></p>
          </div>
        );
      }
      return name;
    });

    const thresholdLegendItems = annotations.map(({ name, color }, key) => {
      if (name === hoveredThresholdName) {
        return {
          title: (
            <div key={key}>
              <p><b>{name}</b></p>
            </div>
          ),
          color
        };
      }
      return { title: name, color };
    });

    return (
      <>
        <EuiFlexGroup>
          <EuiFlexItem>
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
              {Object.keys(data).map((name, key) => (
                <LineMarkSeries
                  key={key}
                  style={getLineSeriesStyle(name)}
                  size={DEFAULT_MARK_SIZE}
                  data={data[name]}
                  onNearestXY={this.onNearestXY}
                />
              ))}
              {annotation && annotations.map(({ data, color, name }, key) => (
                <LineSeries
                  name={name}
                  key={key}
                  data={data}
                  color={color}
                  style={getThresholdStyle(name)}
                />
              ))}
              {hint && (
                <Hint value={hint}>
                  <div style={HINT_STYLES}>({hint.y.toLocaleString()})</div>
                </Hint>
              )}
            </FlexibleXYPlot>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <DiscreteColorLegend
              onItemMouseEnter={this.onThresholdLegendItemMouseEnter}
              onItemMouseLeave={() => this.onThresholdLegendItemMouseEnter(null)}
              items={thresholdLegendItems}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <DiscreteColorLegend
          orientation="horizontal"
          onItemMouseEnter={this.onLineSeriesLegendItemMouseEnter}
          onItemMouseLeave={() => this.onLineSeriesLegendItemMouseEnter(null)}
          items={lineSeriesLegendItems}
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
  values: PropTypes.object.isRequired,
};
