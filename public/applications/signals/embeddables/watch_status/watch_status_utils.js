import { BehaviorSubject } from 'rxjs';

export const WATCH_STATUS_ACTION_ID = 'create_field_list3';
export const WATCH_STATUS_EMBEDDABLE_ID = 'testEmbeddable';

/**
 * The grouping in the Add Panel flyout
 * @type {[{id: string, getIconType: (function(): string), getDisplayName: (function(): string), order: number}]}
 */
export const WATCH_STATUS_ACTION_GROUP = [{
  id: 'searchGuard',
  getIconType: () => 'documentation',
  getDisplayName: () => 'Search Guard',
  order: -10,
}]

export const getStateObservables = (attributes) => {
  const watchId = new BehaviorSubject(attributes.watchId);

  return {
    watchId,
    comparators: {
      watchId: [watchId, (val) => watchId.next(val)],
    },
  };
};
export const serializeAttributes = (state) => {
  return {
    watchId: state.watchId.getValue(),
  };
};
