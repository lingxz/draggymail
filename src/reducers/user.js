import { Record, List, fromJS, Map } from 'immutable';
import { USER_LOGIN, USER_LOGOUT } from '../actions/user';

const initialState = null;

export default function user(state = initialState, action) {
  switch (action.type) {
    case USER_LOGIN:
      return fromJS(action.user);
    case USER_LOGOUT:
      return action.error === false ? initialState : state;
    default:
      return state;
  }
}
