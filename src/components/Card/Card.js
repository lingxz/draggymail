import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Card.css';
import { parseEmailHeader } from '../../utils';

class Card extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		style: PropTypes.object,
    triggerEmailModal: PropTypes.func,
    markAsRead: PropTypes.func,
	}

  constructor(props) {
    super(props);
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
  }

  _handleDoubleClick() {
    const { item, triggerEmailModal, markAsRead } = this.props;
    markAsRead(item.id);
    triggerEmailModal(item);
  }

	render() {
		const { style, item } = this.props;

		return (
	    <div onDoubleClick={this._handleDoubleClick} style={style} className={item.unread ? s.unread: s.root} id={style ? item.id : null}>
	      <div className={s.name}>{parseEmailHeader(item.from).name || parseEmailHeader(item.from).email}</div>
	      <div className={s.container}>
	        <div className={s.content}>
	          <div className={s.author}>{item.subject}</div>
            <p dangerouslySetInnerHTML={{__html: item.snippet}}></p>
	        </div>
	      </div>
	    </div>
		);
	}
}

export default withStyles(s)(Card);
