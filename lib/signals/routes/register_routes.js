import registerWatchRoutes from './watch/register_watch_routes';
import registerWatchesRoutes from './watches/register_watches_routes';
import registerEsRoutes from './es/register_es_routes';
import registerAlertsRoutes from './alerts/register_alerts_routes';
import registerAlertRoutes from './alert/register_alert_routes';
import registerAccountRoutes from './account/register_account_routes';
import registerAccountsRoutes from './accounts/register_accounts_routes';

export default function registerRoutes(server) {
  registerWatchRoutes(server);
  registerWatchesRoutes(server);
  registerEsRoutes(server);
  registerAlertsRoutes(server);
  registerAlertRoutes(server);
  registerAccountRoutes(server);
  registerAccountsRoutes(server);
}
