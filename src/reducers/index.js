import { combineReducers } from 'redux-immutable';
import user from './user';
import runtime from './runtime';
import lists from './lists';
import mailbox from './mailbox';

export default combineReducers({
  user,
  lists,
  mailbox,
});
