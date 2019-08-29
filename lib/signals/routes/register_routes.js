import registerWatchRoutes from './watch/register_watch_routes';
import registerWatchesRoutes from './watches/register_watches_routes';
import registerEsRoutes from './es/register_es_routes';
import registerAlertsRoutes from './alerts/register_alerts_routes';
import registerAlertRoutes from './alert/register_alert_routes';
import registerDestinationRoutes from './destination/register_destination_routes';
import registerDestinationsRoutes from './destinations/register_destinations_routes';

export default function registerRoutes(server) {
  registerWatchRoutes(server);
  registerWatchesRoutes(server);
  registerEsRoutes(server);
  registerAlertsRoutes(server);
  registerAlertRoutes(server);
  registerDestinationRoutes(server);
  registerDestinationsRoutes(server);
}
