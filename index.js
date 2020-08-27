export default function (Kibana) {
  const corePlugin = new Kibana.Plugin({
    name: 'searchguardLegacy',
    id: 'searchguardLegacy',
    require: ['kibana', 'elasticsearch'],
  });

  const apps = [corePlugin];

  return apps;
};
