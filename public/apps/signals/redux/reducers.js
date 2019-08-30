import React from 'react';
import uuid from 'uuid/v4';
import { combineReducers } from 'redux';

import {
  ADD_ERROR_TOAST,
  ADD_SUCCESS_TOAST,
  ADD_WARNING_TOAST,
  REMOVE_TOAST
} from './action_types';

const globalToastList = (state = [], action) => {
  switch (action.type) {
    case ADD_ERROR_TOAST:
    case ADD_SUCCESS_TOAST:
    case ADD_WARNING_TOAST:
      return [
        ...state,
        {
          text: action.text,
          title: action.title,
          color: action.color,
          iconType: action.iconType,
          id: uuid()
        }
      ];
    case REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.id);
    default:
      return state;
  }
};

export default combineReducers({
  globalToastList
});
