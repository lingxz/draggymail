import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import sanitizeHtml from 'sanitize-html';
import s from './Email.css';
import { parseEmailHeader } from '../../utils';

class Email extends React.Component {
  static propTypes = {
    email: PropTypes.object.isRequired,
    last: PropTypes.bool,
  }

  render() {
    const { email, last } = this.props;

    let message = null;
    if (email.textHtml) {
      // message = <div className={s.bodyHtml} dangerouslySetInnerHTML={{__html: sanitizeHtml(email.textHtml)}}></div>;
      message = <div className={s.bodyHtml} dangerouslySetInnerHTML={{__html: email.textHtml}}></div>;
    } else {
      message = <div className={s.bodyPlain}>{email.textPlain}</div>;
    }

    let body = null;
    if (last) {
      body = message;
    } else {
      body = null;
    }

    let fromLine = null;
    const fromText = parseEmailHeader(email.headers.from).name || parseEmailHeader(email.headers.from).email;
    if (!last) {
      fromLine = <div className={s.fromLast}><div>{fromText}</div><div className={s.preview}>{email.textPlain}</div></div>
    } else {
      fromLine = <div className={s.from}><span>{fromText}</span></div>
    }

    return (
      <div className={last ? s.root: s.rootCollapsed}>
        <div className={s.head}>
          { fromLine }
          <div className={s.date}>{email.date}</div>
        </div>
        { body }
      </div>
    );
  }
}

export default withStyles(s)(Email);
