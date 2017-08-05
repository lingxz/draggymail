import { combineReducers } from 'redux-immutable';
import user from './user';
import mailbox from './mailbox';
import labels from './labels';
import modal from './modal';
import labelSelector from './labelSelector';

export default combineReducers({
  user,
  labels,
  mailbox,
  modal,
  labelSelector,
});
