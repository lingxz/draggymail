/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';

function mapStateToProps(state) {
  if (state.toJS().user) {
    return { isLoggedIn: true }
  } else {
    return { isLoggedIn: false }
  }
}

class Navigation extends React.Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
  }

  render() {
    return (
      <div className={s.root} role="navigation">
        { this.props.isLoggedIn && <a className={s.link} target="_blank" href="https://mail.google.com/mail/u/0/">Go to Gmail</a> }
        { this.props.isLoggedIn && <span className={s.spacer}> | </span> }
        { !this.props.isLoggedIn && <Link className={s.link} to="/login">Log in</Link> }
        { !this.props.isLoggedIn && <span className={s.spacer}>or</span> }
        { !this.props.isLoggedIn && <Link className={cx(s.link, s.highlight)} to="/register">Sign up</Link> }
        { this.props.isLoggedIn && <Link className={cx(s.link, s.highlight)} to="/logout">Logout</Link> }
      </div>
    );
  }
}

export default connect(mapStateToProps)(withStyles(s)(Navigation));
