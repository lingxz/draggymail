import { Record, List, fromJS, Map } from 'immutable';
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAILURE,
  UPDATE_USER_CREDENTIALS,
} from '../constants';

const initialState = null;

export default function user(state = initialState, action) {
  switch (action.type) {
    case UPDATE_USER_CREDENTIALS:
      return fromJS(action.user);
    case USER_LOGIN:
      return fromJS(action.user);
    case USER_LOGOUT:
      return initialState;
    case USER_LOGIN_FAILURE:
      return Map();
    default:
      return state;
  }
}
