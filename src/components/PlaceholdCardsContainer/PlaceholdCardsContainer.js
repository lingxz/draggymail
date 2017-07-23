import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PlaceholdCardsContainer.css';

class PlaceholdCardsContainer extends React.Component {

  static propTypes = {
    allLabels: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.toggleShowLabels = this.toggleShowLabels.bind(this);
    this.state = { showLabels: false };
  }

  toggleShowLabels() {
    this.setState({ showLabels: !this.state.showLabels })
  }

  render() {
    const { allLabels } = this.props;

    return (
      <div className={s.root}>
        <button className={s.button} onClick={this.toggleShowLabels}>+</button>
        <div className={ this.state.showLabels ? null : s.hidden }>
          {allLabels.map((item, i) =>
            <p>{item.name}</p>
          )}
        </div>
      </div>
    )
  }
}

export default withStyles(s)(PlaceholdCardsContainer)
