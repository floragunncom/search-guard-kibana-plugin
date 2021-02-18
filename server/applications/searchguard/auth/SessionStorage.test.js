/*
 *    Copyright 2021 floragunn GmbH
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

import { SessionStorage } from './SessionStorage';

describe(SessionStorage.name, () => {
  test('get cookie', async () => {
    const asScopedGet = jest.fn().mockResolvedValueOnce({ a: 'b' });
    const asScoped = jest.fn(() => ({ get: asScopedGet }));
    const sessionStorageFactory = { asScoped }; 
    const storage = new SessionStorage(sessionStorageFactory);

    const request = { headers: { Cookie: 'abc' } };

    expect(await storage.get(request)).toEqual({ a: 'b' });
    expect(asScoped).toHaveBeenCalledWith({ headers: { Cookie: 'abc' } });
  });

  test('set cookie', async () => {
    const asScopedSet = jest.fn();
    const asScoped = jest.fn(() => ({ set: asScopedSet }));
    const sessionStorageFactory = { asScoped }; 
    const storage = new SessionStorage(sessionStorageFactory);

    const request = { headers: { Cookie: 'abc' } };
    const cookie = { a: 'b' };

    storage.set(request, cookie);
    expect(asScoped).toHaveBeenCalledWith({ headers: { Cookie: 'abc' } });
    expect(asScopedSet).toHaveBeenCalledWith({ a: 'b' });
  });

  test('clear cookie', async () => {
    const asScopedClear = jest.fn();
    const asScoped = jest.fn(() => ({ clear: asScopedClear }));
    const sessionStorageFactory = { asScoped }; 
    const storage = new SessionStorage(sessionStorageFactory);

    const request = { headers: { Cookie: 'abc' } };

    storage.clear(request);
    expect(asScoped).toHaveBeenCalledWith({ headers: { Cookie: 'abc' } });
    expect(asScopedClear).toHaveBeenCalledTimes(1);
  });
});