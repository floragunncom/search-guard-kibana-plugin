import avgTicketPrice from './avg_ticket_price/avg_ticket_price.json';
import avgTicketPriceGraph from './avg_ticket_price/avg_ticket_price_graph.json';
import badWeather from './bad_weather/bad_weather.json';
import changeInMemory from './change_in_memory/change_in_memory.json';
import maxMemory from './max_memory/max_memory.json';
import maxMemoryGraph from './max_memory/max_memory_graph.json';
import memoryUsage from './memory_usage/memory_usage.json';
import minProductPrice from './min_product_price/min_product_price.json';
import minProductPriceGraph from './min_product_price/min_product_price_graph.json';
import { WATCH_EXAMPLES } from '../../alerting/constants';

export default {
  [WATCH_EXAMPLES.AVG_TICKET_PRICE]: avgTicketPrice,
  [`${WATCH_EXAMPLES.AVG_TICKET_PRICE}_graph`]: avgTicketPriceGraph,
  [WATCH_EXAMPLES.BAD_WEATHER]: badWeather,
  [WATCH_EXAMPLES.CHANGE_IN_MEMORY]: changeInMemory,
  [WATCH_EXAMPLES.MAX_MEMORY]: maxMemory,
  [`${WATCH_EXAMPLES.MAX_MEMORY}_graph`]: maxMemoryGraph,
  [WATCH_EXAMPLES.MEMORY_USAGE]: memoryUsage,
  [WATCH_EXAMPLES.MIN_PRODUCT_PRICE]: minProductPrice,
  [`${WATCH_EXAMPLES.MIN_PRODUCT_PRICE}_graph`]: minProductPriceGraph
};
