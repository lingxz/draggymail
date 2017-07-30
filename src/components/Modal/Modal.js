import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux";
import ReactModal from 'react-modal';
import { connect } from "react-redux";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as ModalActions from '../../actions/modal';
import s from './Modal.css';

function mapStateToProps(state) {
  const jsState = state.toJS();
  return {
    isOpen: jsState.modal.isOpen,
    showing: jsState.modal.showing,
    item: jsState.modal.item,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ModalActions, dispatch);
}

class Modal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    showing: PropTypes.string,
    item: PropTypes.object,
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

    return (
        <ReactModal
           isOpen={isOpen}
           contentLabel="Minimal Modal Example"
           shouldCloseOnOverlayClick={true}
        >
          <button onClick={this.closeEmailModal}>Close Modal</button>
        </ReactModal>
      )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(s)(Modal));
