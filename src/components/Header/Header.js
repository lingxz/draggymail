/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import logoUrl from './logo-small.png';
import logoUrl2x from './logo-small@2x.png';
import check from './check.svg';

class Header extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.banner}>
            <img className={s.logo} src={check} />
            <h1 className={s.bannerTitle}>donemail</h1>
            <h2 className={s.bannerDesc}>email like how it should be done</h2>
          </div>
        </div>
      </div>
    );
  }
}


export default withStyles(s)(Header);
