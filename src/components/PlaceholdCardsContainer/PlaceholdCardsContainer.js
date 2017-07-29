import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PlaceholdCardsContainer.css';

class PlaceholdCardsContainer extends React.Component {

  static propTypes = {
    allLabels: PropTypes.array,
    addLabelToShow: PropTypes.func,
  }

  render() {
    const { allLabels } = this.props;

    return (
      <div className={s.root}>
        <button className={s.button} onClick={this.props.addLabelToShow}>+</button>
      </div>
    )
  }
}

export default withStyles(s)(PlaceholdCardsContainer)
