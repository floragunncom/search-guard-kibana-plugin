/*
 *    Copyright 2026 floragunn GmbH
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

import {
  getWatchStatusEmbeddableServerDefinition,
  watchStatusEmbeddableSchema,
} from './watch_status_embeddable_definition';
import { Signals } from '../signals';
import { WATCH_STATUS_EMBEDDABLE_ID } from '../../../../common/signals/constants';

describe('signals/embeddables/watch_status_embeddable_definition', () => {
  describe('schema', () => {
    test('accepts the state serialized by the public embeddable', () => {
      const config = {
        watchId: 'avg_ticket_price_graph',
        title: 'Ticket price',
        description: 'Watch status',
        hide_title: false,
      };

      expect(watchStatusEmbeddableSchema.validate(config)).toEqual(config);
    });

    test('accepts a config with only the watch id', () => {
      expect(watchStatusEmbeddableSchema.validate({ watchId: 'my_watch' })).toEqual({
        watchId: 'my_watch',
      });
    });

    test('rejects a missing or empty watch id', () => {
      expect(() => watchStatusEmbeddableSchema.validate({})).toThrow(/watchId/);
      expect(() => watchStatusEmbeddableSchema.validate({ watchId: '' })).toThrow(/watchId/);
    });

    test('strips unknown keys when asked to (dashboard read path)', () => {
      const validated = watchStatusEmbeddableSchema.validate(
        { watchId: 'my_watch', legacyKey: true },
        undefined,
        undefined,
        { stripUnknownKeys: true }
      );

      expect(validated).toEqual({ watchId: 'my_watch' });
    });
  });

  describe('definition', () => {
    test('exposes title and schema', () => {
      const definition = getWatchStatusEmbeddableServerDefinition();

      expect(definition.title).toEqual(expect.any(String));
      expect(definition.getSchema()).toBe(watchStatusEmbeddableSchema);
    });
  });

  describe('Signals.setup', () => {
    const getLogger = () => ({ warn: jest.fn(), error: jest.fn(), debug: jest.fn() });
    const getSignals = (logger) => new Signals({ logger: { get: () => logger } });

    test('registers the definition under the shared embeddable id', () => {
      const logger = getLogger();
      const embeddable = { registerEmbeddableServerDefinition: jest.fn() };

      getSignals(logger).setup({ embeddable });

      expect(embeddable.registerEmbeddableServerDefinition).toHaveBeenCalledTimes(1);
      const [type, definition] = embeddable.registerEmbeddableServerDefinition.mock.calls[0];
      expect(type).toBe(WATCH_STATUS_EMBEDDABLE_ID);
      expect(type).toBe('watch_status_embeddable');
      expect(definition.getSchema()).toBe(watchStatusEmbeddableSchema);
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('warns and does nothing when the embeddable plugin is disabled', () => {
      const logger = getLogger();

      expect(() => getSignals(logger).setup({ embeddable: undefined })).not.toThrow();
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    test('logs instead of throwing when the registration fails', () => {
      const logger = getLogger();
      const embeddable = {
        registerEmbeddableServerDefinition: jest.fn(() => {
          throw new Error('already registered');
        }),
      };

      expect(() => getSignals(logger).setup({ embeddable })).not.toThrow();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('already registered'));
    });
  });
});
