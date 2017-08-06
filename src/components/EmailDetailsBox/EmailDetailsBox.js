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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EmailDetailsBox.css';
import EmailDetailsLine from './EmailDetailsLine';

class EmailDetailsBox extends React.Component {
  static propTypes = {
    email: PropTypes.object,
  }

  render() {
    const { email } = this.props;

    const importantHeaders = {};
    importantHeaders.to = email.headers.to;
    importantHeaders.from = email.headers.from;
    importantHeaders.subject = email.headers.subject;
    importantHeaders.date = email.headers.date;
    importantHeaders.labels = email.labelIds;

    return (
      <div className={s.root}>
        {Object.keys(importantHeaders).map(item =>
          <EmailDetailsLine
            key={item}
            left={item}
            right={importantHeaders[item]}
          />
        )}
      </div>
    );
  }
}

export default withStyles(s)(EmailDetailsBox);
