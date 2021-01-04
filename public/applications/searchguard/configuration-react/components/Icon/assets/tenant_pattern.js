/*
 *    Copyright 2020 floragunn GmbH
 *
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

export const SvgTenantPattern = (props) => (
  <svg id="tenant_pattern_svg__ART" viewBox="0 0 48 48" {...props}>
    <defs>
      <style>
        {'.tenant_pattern_svg__cls-1{fill:#047268}.tenant_pattern_svg__cls-2{fill:#353740}'}
      </style>
    </defs>
    <path
      className="tenant_pattern_svg__cls-1"
      transform="rotate(45 23.895 23.888)"
      d="M6.73 22.87h34.33v2.04H6.73z"
    />
    <path
      className="tenant_pattern_svg__cls-1"
      transform="rotate(-45 23.888 23.895)"
      d="M6.73 22.87h34.33v2.04H6.73z"
    />
    <circle className="tenant_pattern_svg__cls-2" cx={11.89} cy={12.64} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={23.89} cy={12.64} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={35.89} cy={12.64} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={11.89} cy={23.89} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={23.89} cy={23.89} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={35.89} cy={23.89} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={11.89} cy={35.14} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={23.89} cy={35.14} r={3.75} />
    <circle className="tenant_pattern_svg__cls-2" cx={35.89} cy={35.14} r={3.75} />
  </svg>
);
