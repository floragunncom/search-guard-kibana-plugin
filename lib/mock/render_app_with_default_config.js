export default function renderAppWithDefaultConfig() {
  return Promise.resolve({
    app: {},
    headers: {},
    plugins: {},
    request: {}
  });
}
