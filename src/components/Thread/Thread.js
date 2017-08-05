import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Thread.css';
import Email from '../Email';

class Thread extends React.Component {
  static propTypes = {
    thread: PropTypes.object.isRequired,
    closeEmailModal: PropTypes.func,
    archiveThread: PropTypes.func,
    trashThread: PropTypes.func,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.handleArchiveThread = this.handleArchiveThread.bind(this);
    this.handleTrashThread = this.handleTrashThread.bind(this);
  }

  // componentDidMount() {
  //   const header = document.getElementById('header');
  //   const contentPlacement = header.getBoundingClientRect().top + header.clientHeight;
  //   const content = document.getElementById('content');
  //   content.style['margin-top'] = contentPlacement;
  // }

  handleArchiveThread() {
    const { thread, archiveThread, labelId, closeEmailModal } = this.props;
    archiveThread(thread.id, labelId)
    closeEmailModal();
  }

  handleTrashThread() {
    const { thread, trashThread, closeEmailModal } = this.props;
    trashThread(thread.id);
    closeEmailModal();
  }

  render() {
    const { thread, closeEmailModal, user } = this.props;
    const emails = thread.emails;
    const gmailUrl = "https://mail.google.com/mail/u/0/#all/" + thread.id;
    console.log(emails.length);

    return (
      <div className={s.root}>
        <div id="header" className={s.head}>
          <div className={s.emailButtons}>
            <a><i title="Archive thread" className="fa fa-check" onClick={this.handleArchiveThread} aria-hidden="true"></i></a>
            <a><i title="Trash thread" className="fa fa-trash" onClick={this.handleTrashThread} aria-hidden="true"></i></a>
            <a><i title="Change labels" className="fa fa-tag" aria-hidden="true"></i></a>
            <a title="Open in Gmail" href={gmailUrl} target="_blank"><i className="fa fa-envelope-o" aria-hidden="true"></i></a>
          </div>
          <div className={s.subject}>{thread.subject}</div>
          <div className={s.close} onClick={closeEmailModal}></div>
        </div>
        <div id="content" className={s.emails}>
          {emails && emails.map((item, i) =>
            <Email
              user={user}
              key={i}
              email={item}
              last={i===emails.length-1}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Thread);
