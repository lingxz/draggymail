import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux";
import ReactModal from 'react-modal';
import { connect } from "react-redux";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as MailBoxActions from '../../actions/mailbox';
import * as ModalActions from '../../actions/modal';
import s from './Modal.css';
import Thread from '../Thread';

function mapStateToProps(state) {
  const jsState = state.toJS();
  return {
    isOpen: jsState.modal.isOpen,
    showing: jsState.modal.showing,
    item: jsState.modal.item,
    labelId: jsState.modal.labelId,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({...ModalActions, ...MailBoxActions}, dispatch);
}

class Modal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    showing: PropTypes.string,
    item: PropTypes.object,
    labelId: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.closeEmailModal = this.closeEmailModal.bind(this);
  }

  closeEmailModal() {
    this.props.closeEmailModal();
  }

  render() {
    const { isOpen, showing, item } = this.props;

    const style = {
      content: {
        'maxWidth': '1000px',
        'margin': '0 auto',
        'padding': '0',
        'top': '20px',
      }
    };

    return (
      <ReactModal
         isOpen={isOpen}
         contentLabel="Minimal Modal Example"
         shouldCloseOnOverlayClick={true}
         style={style}
         onRequestClose={this.closeEmailModal}
      >
        <Thread
          thread={item}
          closeEmailModal={this.closeEmailModal}
          archiveThread={this.props.requestArchiveThread}
          trashThread={this.props.requestTrashThread}
          labelId={this.props.labelId}
        />
      </ReactModal>
      )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(s)(Modal));
