/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Header from '../../components/Header';
import Layout from '../../components/KanbanLayout';
import LoginButton from '../../components/LoginButton';

function action() {

  return {
    chunks: ['home'],
    title: 'React Starter Kit',
    component: <Layout><Header /><LoginButton /></Layout>,
  };
}

export default action;
