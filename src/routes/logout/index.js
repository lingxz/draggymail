import React from 'react';
import Logout from './Logout';
// import Location from '../core/Location';

function action() {
  return {
    chunks: ['logout'],
    component: <Logout />,
  };
}

export default action;
