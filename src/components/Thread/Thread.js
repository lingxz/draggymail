import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Thread.css';

class Thread extends React.Component {
  static propTypes = {
    thread: PropTypes.object.isRequired,
  }

  render() {
    const { thread } = this.props;
    const emails = thread.emails;

    return (
      <div className={s.root}>
        <div className={s.head}>
          some header with title
        </div>
        <div clasName={s.emails}>
          emails
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Thread);
