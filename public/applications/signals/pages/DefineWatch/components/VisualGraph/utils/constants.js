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

export const SIZE_RANGE = [3, 3];
export const LINE_STYLES = { strokeWidth: '1px' };
export const HOVERED_LINE_STYLES = { strokeWidth: '3px' };
export const ANNOTATION_STYLES = { strokeWidth: 2 };
export const HOVERED_ANNOTATION_STYLES = { strokeWidth: 4 };
export const HINT_STYLES = {
  background: '#3a3a48',
  borderRadius: '5px',
  padding: '7px 10px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#fff',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  boxShadow: '0 2px 4px rgba(0,0,0,.5)',
};

// Don't want values to reach top of graph so increase by a buffer % so we always have a yDomain with a slightly higher max
export const Y_DOMAIN_BUFFER = 1.4; // 40%

// Size of circle for each point on graph
export const DEFAULT_MARK_SIZE = 3;
