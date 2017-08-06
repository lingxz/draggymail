import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import sanitizeHtml from 'sanitize-html';
import s from './Email.css';
import EmailDetailsBox from '../EmailDetailsBox';
import { parseEmailHeadersTo, parseEmailHeader } from '../../utils';
import moment from 'moment';

class Email extends React.Component {
  static propTypes = {
    email: PropTypes.object.isRequired,
    last: PropTypes.bool,
    user: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this._expandRecipientDetails = this._expandRecipientDetails.bind(this);
    this.state = {
      expanded: props.last,
      gmailExtraExpanded: false,
      recipientDetailsExpanded: false,
    }
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded, });
    console.log("toggle expanded!!!")
  }

  _expandRecipientDetails() {
    this.setState({ recipientDetailsExpanded: !this.state.recipientDetailsExpanded })
  }

  render() {
    const { email, user } = this.props;
    const { expanded, recipientDetailsExpanded } = this.state;

    const dateString = moment(Number(email.date)).calendar(null, {
      sameDay: '[Today] hh:mm a',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: '[Yesterday] hh:mm a',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    });

    let message = null;
    if (email.textHtml) {
      // message = <div className={s.bodyHtml} dangerouslySetInnerHTML={{__html: sanitizeHtml(email.textHtml)}}></div>;
      message = <div className={s.bodyHtml} dangerouslySetInnerHTML={{__html: email.textHtml}}></div>;
    } else {
      message = <div className={s.bodyPlain}>{email.textPlain}</div>;
    }

    let body = null;
    if (expanded) {
      body = message;
    } else {
      body = null;
    }

    let fromLine = null;
    const fromText = parseEmailHeader(email.headers.from).name || parseEmailHeader(email.headers.from).email;
    if (!expanded) {
      fromLine = <div><div className={s.from}>{fromText}</div><div className={s.preview}>{email.textPlain}</div></div>
    } else {
      fromLine = <div className={s.fromLast}><span>{fromText}</span></div>
    }

    let toLine = null;
    if (expanded) {
      const { recipientsList, recipientsListPrintable } = parseEmailHeadersTo(email.headers.to);
      toLine = <div className={s.to}>to {recipientsListPrintable.join()} <button onClick={this._expandRecipientDetails}>Expand</button></div>
    }


    // show attachments
    const attachments = [];
    if (email.attachments) {
      for (var i = 0; i < email.attachments.length; i++) {
        let a = email.attachments[i];
        let attachmentLink = "https://mail.google.com/mail/b/" + user.email + "/?ui=2&view=att&disp=safe&zw&th=" + email.id + "&attid=0." + (i+1).toString()
        let item = {
          filename: email.attachments[i].filename,
          dataurl: attachmentLink,
        }
        attachments.push(item);
      };
    }

    return (
      <div className={expanded ? s.root: s.rootCollapsed}>
        <div className={s.head} onClick={this.toggleExpanded}>
          <div className={s.date}>{dateString}</div>
          { fromLine }
        </div>
        { toLine }
        {recipientDetailsExpanded &&
          <EmailDetailsBox
            email={email}
          />
        }
        {expanded && <div className={s.emailBody}>
        { body }
        {expanded && attachments.map((item, i) =>
          <a key={i} href={item.dataurl}>
            <div className={s.attachment}>
              <i className="fa fa-paperclip" aria-hidden="true"></i>
              <span>{item.filename}</span>
            </div>
          </a>
        )}
        </div>}
      </div>
    );
  }
}

export default withStyles(s)(Email);
