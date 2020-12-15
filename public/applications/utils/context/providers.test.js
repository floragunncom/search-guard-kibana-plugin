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

  describe(onSelectChangeProvider.name, () => {
    const field = { onChange: jest.fn() };
    const e = { a: 1 };
    onSelectChangeProvider(e, field);

    expect(field.onChange).toHaveBeenCalledWith(e);
  });

  describe(onSwitchChangeProvider.name, () => {
    const field = { name: 'abc' };
    const form = { setFieldValue: jest.fn() };
    const e = { target: { value: 'true' } };
    onSwitchChangeProvider(e, field, form);

    expect(form.setFieldValue).toHaveBeenCalledWith('abc', false);
  });

  describe(onComboBoxOnBlurProvider.name, () => {
    const field = { name: 'abc' };
    const form = { setFieldTouched: jest.fn() };
    const e = {};
    onComboBoxOnBlurProvider(e, field, form);

    expect(form.setFieldTouched).toHaveBeenCalledWith('abc', true);
  });
});
