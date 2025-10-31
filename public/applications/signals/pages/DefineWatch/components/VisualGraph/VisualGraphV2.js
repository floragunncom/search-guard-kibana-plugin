/*
  * Copyright 2025 floragunn_GmbH
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
  Chart,
  Settings,
  LineSeries,
  LineAnnotation,
  Axis,
  Position,
  ScaleType,
  AnnotationDomainType,
  Tooltip,
} from '@elastic/charts';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { get } from 'lodash';
import { i18n } from '@kbn/i18n';
import { useElasticChartsTheme } from '@kbn/charts-theme';

import {
  getYTitle,
  getXDomain,
  getYDomain,
  formatYAxisTick,
  getDataFromResponse,
  getAggregationTitle,
  isGraphDataEmpty,
} from './utils/helpers';
import { SEVERITY_COLORS } from '../../utils/constants';

// Modified component that receives theme as prop
class VisualGraphV2WithThemeInjected extends Component {
  static defaultProps = { annotation: false };

  state = {
    hoveredSeries: null,
    hoveredThreshold: null,
  };

  renderXYPlot = (data) => {
    const { annotation, values, baseTheme } = this.props;
    const isSeverity = get(values, '_ui.isSeverity', false);
    const thresholdValue = get(values, '_ui.thresholdValue');
    const severityThresholds = get(values, '_ui.severity.thresholds');
    const { hoveredSeries, hoveredThreshold } = this.state;

    // Get series colors from Elastic Charts theme
    const getSeriesColor = (index) => {
      const defaultColors = baseTheme?.colors?.vizColors || [
        '#006BB4', '#017D73', '#F04E98', '#6092C0', '#D36086',
        '#9170B8', '#CA8EAE', '#D6BF57', '#B9A888', '#DA8B45',
      ];
      return defaultColors[index % defaultColors.length];
    };

    // Calculate X and Y domains from data
    const getXYDomains = (data) => {
      let xDomain = [];
      let yDomain = [];

      Object.keys(data).forEach((bucketsName) => {
        const seriesData = data[bucketsName];
        if (seriesData && seriesData.length > 0) {
          xDomain = xDomain.concat(getXDomain(seriesData));
          yDomain = yDomain.concat(getYDomain(seriesData));
        }
      });

      xDomain = xDomain.sort((x, y) => x - y);
      yDomain = yDomain.sort((x, y) => x - y);

      return {
        xDomain: xDomain.length > 0 ? [xDomain[0], xDomain[xDomain.length - 1]] : undefined,
        yDomain: yDomain.length > 0 ? [yDomain[0], yDomain[yDomain.length - 1]] : undefined,
      };
    };

    const { xDomain, yDomain } = getXYDomains(data);
    const xTitle = values._ui.timeField;
    const yTitle = getYTitle(values);
    const aggregationTitle = getAggregationTitle(values);

    // Build threshold annotations array
    let annotations = [];

    if (annotation && xDomain && yDomain) {
      if (isSeverity && severityThresholds) {
        Object.keys(severityThresholds).forEach((name) => {
          if (severityThresholds[name]) {
            annotations.push({
              value: severityThresholds[name],
              color: SEVERITY_COLORS[name],
              name,
            });
          }
        });
      } else if (thresholdValue) {
        annotations.push({
          value: thresholdValue,
          color: SEVERITY_COLORS.error,
          name: 'threshold',
        });
      }
    }

    // Calculate line style based on hover state
    const getLineStyle = (seriesName) => {
      if (hoveredSeries && hoveredSeries !== seriesName) {
        return { line: { strokeWidth: 2, opacity: 0.3 } };
      }
      if (hoveredSeries === seriesName) {
        return { line: { strokeWidth: 4, opacity: 1 } };
      }
      return { line: { strokeWidth: 2, opacity: 1 } };
    };

    const getAnnotationStyle = (annotationName) => {
      const baseWidth = hoveredThreshold === annotationName ? 4 : 2;
      const opacity = hoveredThreshold && hoveredThreshold !== annotationName ? 0.3 : 1;
      return { line: { strokeWidth: baseWidth, opacity } };
    };

    return (
      <EuiFlexGroup direction="column" gutterSize="none">
        <EuiFlexItem>
          <div style={{ position: 'relative' }}>
            {/* Aggregation title - displayed above chart */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                padding: '5px 0',
                fontWeight: 500,
              }}
            >
              {aggregationTitle}
            </div>

            <Chart size={{ height: 400 }}>
              <Settings
                baseTheme={baseTheme}
                locale={i18n.getLocale()}
                showLegend={false}
                theme={{
                  lineSeriesStyle: {
                    point: {
                      visible: true,
                      radius: 3,
                    },
                  },
                  axes: {
                    axisTitle: {
                      visible: true,
                    },
                    tickLabel: {
                      fontSize: 11,
                      padding: 5,
                    },
                  },
                }}
              />

              {/* Tooltip - shows series name and value, hides timestamp */}
              <Tooltip type="vertical" headerFormatter={() => ''} />

              {/* Line series for each data bucket */}
              {Object.keys(data).map((name) => {
                const seriesData = data[name] || [];
                // Convert Date objects to timestamps (milliseconds) for Elastic Charts
                const formattedData = seriesData.map(point => ({
                  x: point.x instanceof Date ? point.x.getTime() : point.x,
                  y: point.y
                }));
                return (
                  <LineSeries
                    key={name}
                    id={name}
                    name={name}
                    xScaleType={ScaleType.Time}
                    yScaleType={ScaleType.Linear}
                    xAccessor="x"
                    yAccessors={['y']}
                    data={formattedData}
                    lineSeriesStyle={getLineStyle(name)}
                  />
                );
              })}

              {/* Threshold annotation lines */}
              {annotations.map(({ value, color, name }, key) => (
                <LineAnnotation
                  key={`annotation-${key}`}
                  id={`threshold-${name}`}
                  domainType={AnnotationDomainType.YDomain}
                  dataValues={[{ dataValue: value }]}
                  style={{
                    ...getAnnotationStyle(name),
                    line: {
                      ...getAnnotationStyle(name).line,
                      stroke: color,
                    },
                  }}
                />
              ))}

              {/* X Axis - Time */}
              <Axis
                id="bottom-axis"
                position={Position.Bottom}
                title={xTitle}
                showOverlappingTicks={false}
                showOverlappingLabels={false}
              />

              {/* Y Axis - Values */}
              <Axis
                id="left-axis"
                position={Position.Left}
                title={yTitle}
                tickFormat={formatYAxisTick}
              />
            </Chart>
          </div>
        </EuiFlexItem>

        {/* Custom legends section */}
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="m" responsive={false}>
            <EuiFlexItem grow={true}>
              {/* Horizontal legend for data series */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '8px' }}>
                {Object.keys(data).map((name, index) => (
                  <div
                    key={name}
                    onMouseEnter={() => this.setState({ hoveredSeries: name })}
                    onMouseLeave={() => this.setState({ hoveredSeries: null })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontWeight: hoveredSeries === name ? 'bold' : 'normal',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getSeriesColor(index),
                        marginRight: '8px',
                      }}
                    />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </EuiFlexItem>

            {annotations.length > 0 && (
              <EuiFlexItem grow={false}>
                {/* Vertical legend for thresholds */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                  {annotations.map(({ name, color }) => (
                    <div
                      key={name}
                      onMouseEnter={() => this.setState({ hoveredThreshold: name })}
                      onMouseLeave={() => this.setState({ hoveredThreshold: null })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontWeight: hoveredThreshold === name ? 'bold' : 'normal',
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: color,
                          marginRight: '8px',
                        }}
                      />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  renderEmptyData = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '450px',
      }}
    >
      <p id="sgSignals.graphWatch.graphMessage">There is no data for the current selections</p>
    </div>
  );

  render() {
    const { response } = this.props;
    const data = getDataFromResponse(response);

    return (
      <div
        style={{ padding: '20px', border: '1px solid #D9D9D9', borderRadius: '5px' }}
        id="sgSignals.graphWatch.graphV2"
      >
        {!isGraphDataEmpty(data) ? this.renderXYPlot(data) : this.renderEmptyData()}
      </div>
    );
  }
}

VisualGraphV2WithThemeInjected.propTypes = {
  response: PropTypes.object,
  annotation: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  baseTheme: PropTypes.object.isRequired,
};

// Hook wrapper to inject Elastic Charts theme into class component (see src/platform/packages/shared/kbn-charts-theme/index.ts)
function VisualGraphV2WithTheme(props) {
  const baseTheme = useElasticChartsTheme();

  return <VisualGraphV2WithThemeInjected {...props} baseTheme={baseTheme} />;
}

export { VisualGraphV2WithTheme };
