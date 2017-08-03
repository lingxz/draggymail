import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactModal from 'react-modal';
import s from './Board.css';
import CardsContainer from '../CardsContainer';
import PlaceholdCardsContainer from '../PlaceholdCardsContainer';
import * as MailBoxActions from '../../actions/mailbox';
import CustomDragLayer from './CustomDragLayer';
import { GMAIL_UNREAD_SYNC_MS, FETCH_ALL_MAILBOX_LABELS } from '../../constants';

function mapStateToProps(state) {
  const jsState = state.toJS();
  return {
    user: jsState.user,
    labels: jsState.labels,
    labelsToShow: jsState.labels.labelsToShow,
    mailbox: jsState.mailbox,
    allLabels: jsState.labels.allLabels,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(MailBoxActions, dispatch);
}

class Board extends React.Component {

  static propTypes = {
    labelsToShow: PropTypes.array.isRequired,
    labels: PropTypes.object,
    mailbox: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    allLabels: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
    this.moveLabel = this.moveLabel.bind(this);
    this.requestPartialSyncMailBox = this.requestPartialSyncMailBox.bind(this);
    this.requestFetchAllLabels = this.requestFetchAllLabels.bind(this);
    this.scrollRight = this.scrollRight.bind(this);
    this.scrollLeft = this.scrollLeft.bind(this);
    this.stopScrolling = this.stopScrolling.bind(this);
    this.startScrolling = this.startScrolling.bind(this);
    this.state = { isScrolling: false };
    this.partialSyncTick = this.partialSyncTick.bind(this);
    this.fetchAllLabelsTick = this.fetchAllLabelsTick.bind(this);
    this.addLabelToShow = this.addLabelToShow.bind(this);
    this.requestChangeLabelToShow = this.requestChangeLabelToShow.bind(this);
    this.requestRemoveLabelToShow = this.requestRemoveLabelToShow.bind(this);
    this.triggerEmailModal = this.triggerEmailModal.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  triggerEmailModal(item, labelId) {
    this.props.triggerEmailModal(item, labelId);
  }

  partialSyncTick() {
    this.requestPartialSyncMailBox();
  }

  fetchAllLabelsTick() {
    this.requestFetchAllLabels();
  }

  componentDidMount() {
    this.partialSyncInterval = setInterval(this.partialSyncTick, 30*1000);
    // this.interval = setInterval(this.tick, GMAIL_UNREAD_SYNC_MS);
    this.fetchAllLabelsInterval = setInterval(this.fetchAllLabelsTick, FETCH_ALL_MAILBOX_LABELS)
  }

  componentWillUnmount() {
    clearInterval(this.partialSyncInterval)
    clearInterval(this.fetchAllLabelsInterval)
  }

  startScrolling(direction) {
    // if (!this.state.isScrolling) {
    switch (direction) {
      case 'toLeft':
        this.setState({ isScrolling: true }, this.scrollLeft());
        break;
      case 'toRight':
        this.setState({ isScrolling: true }, this.scrollRight());
        break;
      default:
        break;
    }
    // }
  }

  scrollRight() {
    function scroll() {
      document.getElementById('KanbanLayout').scrollLeft += 10;
    }
    this.scrollInterval = setInterval(scroll, 10);
  }

  scrollLeft() {
    function scroll() {
      document.getElementById('KanbanLayout').scrollLeft -= 10;
    }
    this.scrollInterval = setInterval(scroll, 10);
  }

  stopScrolling() {
    this.setState({ isScrolling: false }, clearInterval(this.scrollInterval));
  }

  requestPartialSyncMailBox() {
    this.props.requestPartialSyncMailBox();
  }

  requestFetchAllLabels() {
    this.props.requestFetchAllLabels();
  }

  requestChangeLabelToShow(position, oldLabelId, newLabelId) {
    this.props.requestChangeLabelToShow(position, oldLabelId, newLabelId);
  }

  requestRemoveLabelToShow(position) {
    this.props.requestRemoveLabelToShow(position);
  }

  moveCard(lastLabelId, nextLabelId, lastY) {
    this.props.moveCard(lastLabelId, nextLabelId, lastY);
  }

  moveLabel(lastX, nextX) {
    this.props.moveLabel(lastX, nextX);
  }

  moveList(lastX, nextX) {
    this.props.moveList(lastX, nextX);
  }

  addLabelToShow() {
    this.props.addLabelToShow();
  }

  markAsRead(threadId) {
    this.props.requestMarkAsRead(threadId);
  }

  render() {
    const { mailbox, labelsToShow, allLabels } = this.props;

    // wait for data to fetch, maybe should find a better way to do this...
    // TODO: remove this hack when loading data from db, load labels first before loading
    // labelsToShow
    // this should be done somewhere else...
    let canShow = true;
    for (var i = 0; i < labelsToShow.length; i++) {
      if (Object.keys(mailbox).indexOf(labelsToShow[i]) === -1) {
        canShow = false;
        break
      }
    }

    return (
      <div className={s.root}>
        <CustomDragLayer snapToGrid={false} />
        {canShow && labelsToShow.map((item, i) =>
          <CardsContainer
            // key={mailbox[item].id}
            key={i}
            labelId={mailbox[item].id}
            item={mailbox[item]}
            moveCard={this.moveCard}
            moveLabel={this.moveLabel}
            startScrolling={this.startScrolling}
            stopScrolling={this.stopScrolling}
            isScrolling={this.state.isScrolling}
            requestChangeLabel={this.requestChangeLabelToShow}
            requestRemoveLabel={this.requestRemoveLabelToShow}
            allLabels={allLabels}
            triggerEmailModal={this.triggerEmailModal}
            markAsRead={this.markAsRead}
            archiveThread={this.props.requestArchiveThread}
            trashThread={this.props.requestTrashThread}
            x={i}
          />
        )}

        {canShow &&
          <PlaceholdCardsContainer
            key='placeholder'
            addLabelToShow={this.addLabelToShow}
            allLabels={allLabels} />}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(withStyles(s)(Board)));
