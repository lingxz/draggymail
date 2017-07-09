import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Card.css';

class Card extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		style: PropTypes.object
	}
	render() {
		const { style, item } = this.props;
		return (
	    <div style={style} className={s.root} id={style ? item.id : null}>
	      <div className={s.name}>{item.title}</div>
	      <div className={s.container}>
	        <div className={s.avatar}>
	          <img src={`https://randomuser.me/api/portraits/med/men/${item.id}.jpg`} alt="" />
	        </div>
	        <div className={s.content}>
	          <div className={s.author}>{`${item.firstName} ${item.lastName}`}</div>
	          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero, banditos.</p>
	        </div>
	      </div>
	    </div>
		);
	}
}

export default withStyles(s)(Card);
