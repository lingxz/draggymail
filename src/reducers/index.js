import { combineReducers } from 'redux-immutable';
import user from './user';
import runtime from './runtime';
import mailbox from './mailbox';
import labels from './labels';

export default combineReducers({
  user,
  labels,
  mailbox,
});
