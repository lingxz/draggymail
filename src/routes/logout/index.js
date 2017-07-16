import React from 'react';
// import Location from '../core/Location';
import { logout } from '../../actions/user';

function action({ store }) {
  store.dispatch(logout())
  return { redirect: '/login' }
}

export default action;
