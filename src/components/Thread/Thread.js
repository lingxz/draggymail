import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Thread.css';
import Email from '../Email';

class Thread extends React.Component {
  static propTypes = {
    thread: PropTypes.object.isRequired,
    closeEmailModal: PropTypes.func,
  }

  render() {
    const { thread, closeEmailModal } = this.props;
    const emails = thread.emails;
    console.log(emails.length);

    return (
      <div className={s.root}>
        <div className={s.head}>
          <div className={s.subject}>{thread.subject}</div>
          <div className={s.close} onClick={closeEmailModal}></div>
        </div>
        <div className={s.emails}>
          {emails && emails.map((item, i) =>
            <Email
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
