/**
 *    Copyright 2016 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import chrome from 'ui/chrome';
import 'ui/autoload/styles';
import 'plugins/searchguard/apps/login/login.less';
import LoginController from './login_controller';

chrome
.setVisible(false)
.setRootTemplate(require('plugins/searchguard/apps/login/login.html'))
.setRootController('ui', LoginController);
