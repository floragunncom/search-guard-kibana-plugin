/*
 *    Copyright 2022 floragunn GmbH
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
import { groupActionsByAckState } from './helpers';

// @todo Add test(s) for ack_enabled: false

function getSampleData() {
  const ackedActions = {
    slack1: {
      last_status: {
        code: 'ACKED',
        detail: 'Already acked',
      },
      acked: {
        on: '2022-10-12T09:19:38.239765Z',
        by: 'admin',
      },
    },
    slack2: {
      last_status: {
        code: 'ACKED',
        detail: 'Already acked',
      },
      acked: {
        on: '2022-10-12T09:19:38.239765Z',
        by: 'admin',
      },
    },
  };

  const notAckedActions = {
    slack3: {
      last_status: {
        code: 'NO_ACTION',
      },
    },
    slack4: {
      last_status: {
        code: 'NO_ACTION',
      },
    },
  };

  // Prevent mutatation...
  return {
    ackedActions: JSON.parse(JSON.stringify(ackedActions)),
    notAckedActions: JSON.parse(JSON.stringify(notAckedActions)),
  };
}
describe('groupActions tests', () => {
  test('Group actions by ack and notAcked', () => {
    const { ackedActions, notAckedActions } = getSampleData();

    const actions = {
      ...ackedActions,
      ...notAckedActions,
    };
    const result = groupActionsByAckState(actions);
    expect(Object.keys(result.acked).length).toBe(2);
    expect(result.acked).toStrictEqual(ackedActions);

    expect(Object.keys(result.notAcked).length).toBe(2);
    expect(result.notAcked).toStrictEqual(notAckedActions);
  });

  test('Group filtered actions by ack, notAcked', () => {
    const { ackedActions, notAckedActions } = getSampleData();

    const actions = {
      ...ackedActions,
      ...notAckedActions,
    };
    const result = groupActionsByAckState(actions, ['slack2', 'slack4']);
    expect(Object.keys(result.acked).length).toBe(1);
    expect(result.acked).toStrictEqual({ slack2: ackedActions.slack2 });

    expect(Object.keys(result.notAcked).length).toBe(1);
    expect(result.notAcked).toStrictEqual({ slack4: notAckedActions.slack4 });
  });
});
