export const TYPES = [
  { value: 'cluster', text: 'Cluster' },
  { value: 'index', text: 'Index' },
  { value: 'signals', text: 'Signals' }
];

export const DEFAULT_ACTION_GROUP = {
  type: TYPES[0].value,
  _name: '',
  _permissions: [],
  _actiongroups: [],
  _isAdvanced: false
};
