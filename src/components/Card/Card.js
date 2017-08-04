import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Card.css';
import { parseEmailHeader } from '../../utils';

class Card extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
    labelId: PropTypes.string.isRequired,
		style: PropTypes.object,
    triggerEmailModal: PropTypes.func,
    markAsRead: PropTypes.func,
    archiveThread: PropTypes.func,
    trashThread: PropTypes.func,
	}

  constructor(props) {
    super(props);
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleArchiveThread = this._handleArchiveThread.bind(this);
    this._handleTrashThread = this._handleTrashThread.bind(this);
  }

  _handleDoubleClick() {
    const { item, triggerEmailModal, markAsRead, labelId } = this.props;
    markAsRead(item.id);
    triggerEmailModal(item, labelId);
  }

  _handleArchiveThread() {
    const { item, archiveThread, labelId } = this.props;
    archiveThread(item.id, labelId)
  }

  _handleTrashThread() {
    const { item, trashThread } = this.props;
    trashThread(item.id)
  }

	render() {
		const { style, item } = this.props;
    const gmailUrl = "https://mail.google.com/mail/u/0/#all/" + item.id;

		return (
	    <div onDoubleClick={this._handleDoubleClick} style={style} className={item.unread ? s.unread: s.root} id={style ? item.id : null}>
	      <div className={s.emailHead}>
          <div className={s.name}>{parseEmailHeader(item.from).name || parseEmailHeader(item.from).email}</div>
          <div className={s.emailButtons}>
            <a><i title="Archive thread" className="fa fa-check" onClick={this._handleArchiveThread} aria-hidden="true"></i></a>
            <a><i title="Trash thread" className="fa fa-trash" onClick={this._handleTrashThread} aria-hidden="true"></i></a>
            <a><i title="Change labels" className="fa fa-tag" aria-hidden="true"></i></a>
            <a title="Open in Gmail" href={gmailUrl} target="_blank"><i className="fa fa-envelope-o" aria-hidden="true"></i></a>
          </div>
        </div>
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
