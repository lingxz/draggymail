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
import { connect } from "react-redux";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EmailDetailsLine.css';
import * as utils from '../../utils';

function mapStateToProps(state) {
  const jsState = state.toJS();
  return {
    allLabels: jsState.labels.allLabels,
  };
}

class EmailDetailsLine extends React.Component {
  static propTypes = {
    left: PropTypes.string,
    right: PropTypes.string,
    allLabels: PropTypes.array,
  }

  render() {
    const { left, right, allLabels } = this.props;
    // turn right into array
    let rightArray = null;
    let rightLabelList = null;
    if (left === 'to' || left === 'from') {
      const { recipientsList } = utils.parseEmailHeadersTo(right);
      rightArray = recipientsList;
    }

    if (left === 'labels') {
      rightLabelList = [];
      const labelsDict = {};
      for (var i = 0; i < allLabels.length; i++) {
        labelsDict[allLabels[i].id] = allLabels[i];
      }
      for (var i = 0; i < right.length; i++) {
        let name = labelsDict[right[i]].name;
        rightLabelList.push(name);
      }
    }

    return (
      <div className={s.root}>
        <div className={s.left}>{left}:</div>
        {rightArray && <span className={s.right}>
          {rightArray.map((item, i) =>
            <div key={i}>
              <span><b>{item.name}</b> &lt;{item.email}&gt;</span>
            </div>
          )}
        </span>}
        {rightLabelList && <span className={s.right}>
          {rightLabelList.map((item, i) =>
            <div key={i}>
              <span>{item}</span>
            </div>
          )}
        </span>}
        {!rightArray && !rightLabelList && <span className={s.right}>{right}</span>}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withStyles(s)(EmailDetailsLine));
