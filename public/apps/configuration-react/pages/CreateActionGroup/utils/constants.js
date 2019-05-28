export const TYPES = [
  { value: 'cluster', text: 'cluster' },
  { value: 'index', text: 'index' },
  { value: 'kibana', text: 'kibana' }
];

export const DEFAULT_ACTION_GROUP = {
  type: TYPES[0].value,
  _name: '',
  _permissions: [],
  _actiongroups: [],
  _isAdvanced: false
};
