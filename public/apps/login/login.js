import chrome from 'ui/chrome';
import 'plugins/searchguard/apps/login/login.less';
import LoginController from './login_controller';

chrome
.setVisible(false)
.setRootTemplate(require('plugins/searchguard/apps/login/login.html'))
.setRootController('ui', LoginController);
