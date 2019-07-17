import Hapi from 'hapi'; // eslint-disable-line import/no-extraneous-dependencies

const defaultConfig = {
  'kibana.index': '.kibana'
};

export default function createMockServer(config = defaultConfig) {
  const server = new Hapi.Server({
    port: 0,
    routes: {},
  });

  server.config = () => ({
    set(key, value) {
      config[key] = value; // eslint-disable-line no-param-reassign
    },
    get(key) {
      return config[key];
    },
    has(key) {
      return !!config[key];
    },
  });

  return server;
}
