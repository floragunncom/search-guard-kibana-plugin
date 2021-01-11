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

import {
  closeFlyoutProvider,
  triggerFlyoutProvider,
  closeModalProvider,
  triggerErrorDetailsModalProvider,
  triggerConfirmModalProvider,
  triggerConfirmDeletionModalProvider,
  onSelectChangeProvider,
  onSwitchChangeProvider,
  onComboBoxOnBlurProvider,
  triggerErrorCalloutProvider,
  triggerSuccessCalloutProvider,
  onComboBoxChangeProvider,
  onComboBoxCreateOptionProvider,
} from './providers';
import { MODALS, CALLOUTS } from '../constants';

describe('context/providers', () => {
  test(closeFlyoutProvider.name, () => {
    const setFlyout = jest.fn();
    closeFlyoutProvider({ setFlyout });

    expect(setFlyout).toHaveBeenCalledWith(null);
  });

  describe(triggerFlyoutProvider.name, () => {
    test('is new flyout', () => {
      const setFlyout = jest.fn();
      const flyout = { type: 'flyout' };
      const prevFlyout = null;
      triggerFlyoutProvider({ flyout, prevFlyout, setFlyout });

      expect(setFlyout).toHaveBeenCalledWith(flyout);
    });

    test('is same flyout', () => {
      const setFlyout = jest.fn();
      const flyout = { type: 'flyout' };
      const prevFlyout = { type: 'flyout' };

      triggerFlyoutProvider({ flyout, prevFlyout, setFlyout });

      expect(setFlyout).toHaveBeenCalledWith(null);
    });
  });

  test(closeModalProvider.name, () => {
    const setModal = jest.fn();
    closeModalProvider({ setModal });

    expect(setModal).toHaveBeenCalledWith(null);
  });

  describe(triggerErrorDetailsModalProvider.name, () => {
    test('set modal', () => {
      const setModal = jest.fn();
      const payload = { a: 1 };
      const expectedModal = { type: MODALS.ERROR_TOAST_DETAILS, payload: { a: 1 } };
      triggerErrorDetailsModalProvider({ setModal, payload });

      expect(setModal).toHaveBeenCalledWith(expectedModal);
    });

    test('remove modal', () => {
      const setModal = jest.fn();
      const payload = null;
      triggerErrorDetailsModalProvider({ setModal, payload });

      expect(setModal).toHaveBeenCalledWith(null);
    });
  });

  describe(triggerConfirmModalProvider.name, () => {
    test('set modal', () => {
      const setModal = jest.fn();
      const payload = { a: 1 };
      const expectedModal = { type: MODALS.CONFIRM, payload: { a: 1 } };
      triggerConfirmModalProvider({ setModal, payload });

      expect(setModal).toHaveBeenCalledWith(expectedModal);
    });

    test('remove modal', () => {
      const setModal = jest.fn();
      const payload = null;
      triggerConfirmModalProvider({ setModal, payload });

      expect(setModal).toHaveBeenCalledWith(null);
    });
  });

  describe(triggerConfirmDeletionModalProvider.name, () => {
    test('set modal', () => {
      const setModal = jest.fn();
      const payload = { a: 1 };
      const expectedModal = { type: MODALS.CONFIRM_DELETION, payload: { a: 1 } };
      triggerConfirmDeletionModalProvider({ setModal, payload });

      expect(setModal).toHaveBeenCalledWith(expectedModal);
    });

    test('remove modal', () => {
      const setModal = jest.fn();
      const payload = null;
      triggerConfirmDeletionModalProvider({ setModal, payload });

      expect(setModal).toHaveBeenCalledWith(null);
    });
  });

  test(onSelectChangeProvider.name, () => {
    const field = { onChange: jest.fn() };
    const e = { a: 1 };
    onSelectChangeProvider(e, field);

    expect(field.onChange).toHaveBeenCalledWith(e);
  });

  test(onSwitchChangeProvider.name, () => {
    const field = { name: 'abc' };
    const form = { setFieldValue: jest.fn() };
    const e = { target: { value: 'true' } };
    onSwitchChangeProvider(e, field, form);

    expect(form.setFieldValue).toHaveBeenCalledWith('abc', false);
  });

  test(onComboBoxOnBlurProvider.name, () => {
    const field = { name: 'abc' };
    const form = { setFieldTouched: jest.fn() };
    const e = {};
    onComboBoxOnBlurProvider(e, field, form);

    expect(form.setFieldTouched).toHaveBeenCalledWith('abc', true);
  });

  describe(onComboBoxChangeProvider.name, () => {
    test('changes correctly', () => {
      const options = [{ label: 'a' }, { label: 'b' }];
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldValue: jest.fn() };

      onComboBoxChangeProvider()(options, field, form);
      expect(form.setFieldValue).toHaveBeenCalledWith(field.name, options);
    });

    test('changes correctly and sets error (resolve)', async () => {
      const options = [{ label: 'a' }, { label: 'b' }];
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldError: jest.fn(), setFieldValue: jest.fn() };
      const validationFn = jest.fn(() => Promise.resolve(null));

      await onComboBoxChangeProvider({ validationFn })(options, field, form);
      expect(form.setFieldError).toHaveBeenCalledWith(field.name, null);
      expect(form.setFieldValue).toHaveBeenCalledWith(field.name, options);
    });

    test('changes correctly and sets error (rejects)', async () => {
      const options = [{ label: 'a' }, { label: 'b' }];
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldError: jest.fn(), setFieldValue: jest.fn() };
      const validationFn = jest.fn(() => Promise.reject(new Error('nasty!')));

      await onComboBoxChangeProvider({ validationFn })(options, field, form);
      expect(form.setFieldError).toHaveBeenCalledWith(field.name, 'nasty!');
      expect(form.setFieldValue).toHaveBeenCalledWith(field.name, options);
    });

    test('changes correctly and sets error', () => {
      const options = [{ label: 'a' }, { label: 'b' }];
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldError: jest.fn(), setFieldValue: jest.fn() };
      const validationFn = jest.fn().mockReturnValue(null);

      onComboBoxChangeProvider({ validationFn })(options, field, form);
      expect(form.setFieldError).toHaveBeenCalledWith(field.name, null);
      expect(form.setFieldValue).toHaveBeenCalledWith(field.name, options);
    });
  });

  describe(onComboBoxCreateOptionProvider.name, () => {
    test('creates value if valid', () => {
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldValue: jest.fn() };
      const validationFn = jest.fn().mockReturnValue(true);

      onComboBoxCreateOptionProvider(validationFn)('b', field, form);
      expect(form.setFieldValue).toHaveBeenCalledWith(field.name, [{ label: 'a' }, { label: 'b' }]);
    });

    test('creates no value if invalid', () => {
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldValue: jest.fn() };
      const validationFn = jest.fn().mockReturnValue(false);

      onComboBoxCreateOptionProvider(validationFn)('b', field, form);
      expect(form.setFieldValue).toHaveBeenCalledTimes(0);
    });

    test('creates value if valid (resolve)', async () => {
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldValue: jest.fn() };
      const validationFn = jest.fn(() => Promise.resolve(true));

      await onComboBoxCreateOptionProvider(validationFn)('b', field, form);
      expect(form.setFieldValue).toHaveBeenCalledWith(field.name, [{ label: 'a' }, { label: 'b' }]);
    });

    test('creates no value if invalid (resolve)', async () => {
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldValue: jest.fn() };
      const validationFn = jest.fn(() => Promise.resolve(false));

      await onComboBoxCreateOptionProvider(validationFn)('b', field, form);
      expect(form.setFieldValue).toHaveBeenCalledTimes(0);
    });

    test('creates no value if invalid (reject)', () => {
      const field = { name: 'field', value: [{ label: 'a' }] };
      const form = { setFieldValue: jest.fn() };
      const validationFn = jest.fn(() => Promise.reject(false));

      onComboBoxCreateOptionProvider(validationFn)('b', field, form);
      expect(form.setFieldValue).toHaveBeenCalledTimes(0);
    });
  });

  describe(triggerErrorCalloutProvider.name, () => {
    test('callout details', () => {
      const error = new Error('nasty');
      error.body = {
        attributes: {
          body: { a: 1, b: { c: 2 } },
        },
      };
      const setCallout = jest.fn();

      triggerErrorCalloutProvider({ error, setCallout });
      expect(setCallout).toHaveBeenCalledWith({
        type: CALLOUTS.ERROR_CALLOUT,
        payload: `nasty: ${JSON.stringify({ a: 1, b: { c: 2 } }, null, 2)}`,
      });
    });

    test('callout no details', () => {
      const error = new Error('nasty');
      const setCallout = jest.fn();

      triggerErrorCalloutProvider({ error, setCallout });
      expect(setCallout).toHaveBeenCalledWith({
        type: CALLOUTS.ERROR_CALLOUT,
        payload: 'nasty',
      });
    });
  });

  test(triggerSuccessCalloutProvider.name, () => {
    const payload = 'success!';
    const setCallout = jest.fn();

    triggerSuccessCalloutProvider({ payload, setCallout });
    expect(setCallout).toHaveBeenCalledWith({
      type: CALLOUTS.SUCCESS_CALLOUT,
      payload,
    });
  });
});
