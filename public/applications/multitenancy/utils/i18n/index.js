/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2021 floragunn GmbH
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
import { EuiI18n } from '@elastic/eui';

export const yourTenantsText = (
  <EuiI18n token="sp.tenantsMenu.yourTenants" default="Your tenants" />
);
export const addMoreTenantsText = (
  <EuiI18n token="sp.tenantsMenu.addMoreTenants" default="Add more tenants" />
);
export const noTenantOrIndexText = (
  <EuiI18n token="sp.tenantsMenu.noTenantOrIndex" default="No tenant or index" />
);
export const readWriteText = <EuiI18n token="sp.tenantsMenu.readWrite" default="read/write" />;
export const readText = <EuiI18n token="sp.tenantsMenu.read" default="read" />;
export const selectedText = <EuiI18n token="sp.tenantsMenu.selected" default="Selected" />;
