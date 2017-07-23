import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
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
    mailbox: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    allLabels: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
    this.moveList = this.moveList.bind(this);
    this.findList = this.findList.bind(this);
    this.tick = this.tick.bind(this);
    this.syncMailBoxLabel = this.syncMailBoxLabel.bind(this);
    this.fetchAllLabelsAction = this.fetchAllLabelsAction.bind(this);
    this.scrollRight = this.scrollRight.bind(this);
    this.scrollLeft = this.scrollLeft.bind(this);
    this.stopScrolling = this.stopScrolling.bind(this);
    this.startScrolling = this.startScrolling.bind(this);
    this.state = { isScrolling: false };
  }

  tick() {
    const { user, labelsToShow, mailbox } = this.props;
    for (var i = 0; i < labelsToShow.length; i++) {
      this.syncMailBoxLabel(user, mailbox[labelsToShow[i]])
    }
  }

  fetchAllLabelsTick() {
    const { user } = this.props;
    this.fetchAllLabelsAction(user);
  }

  componentDidMount() {
    this.interval = setInterval(this.tick, GMAIL_UNREAD_SYNC_MS);
    this.fetchAllLabelsInterval = setInterval(this.fetchAllLabelsTick, FETCH_ALL_MAILBOX_LABELS)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
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

  syncMailBoxLabel(user, label) {
    this.props.syncMailBoxLabel(user, label);
  }

  fetchAllLabelsAction(user) {
    this.props.fetchAllLabelsAction(user);
  }

  moveCard(lastX, lastY, nextX, nextY) {
    this.props.moveCard(lastX, lastY, nextX, nextY);
  }

  moveList(listId, nextX) {
    const { lastX } = this.findList(listId);
    this.props.moveList(lastX, nextX);
  }

  findList(id) {
    const { mailbox, labelsToShow } = this.props;

    return {
      lists: mailbox[id].emails,
      lastX: labelsToShow.indexOf(id)
    };
  }

  render() {
    const { mailbox, labelsToShow, allLabels } = this.props;
    return (
      <div className={s.root}>
        <CustomDragLayer snapToGrid={false} />
        {labelsToShow.map((item, i) =>
          <CardsContainer
            key={mailbox[item].id}
            labelId={mailbox[item].id}
            item={mailbox[item]}
            moveCard={this.moveCard}
            moveList={this.moveList}
            startScrolling={this.startScrolling}
            stopScrolling={this.stopScrolling}
            isScrolling={this.state.isScrolling}
            x={i}
          />
        )}
        <PlaceholdCardsContainer allLabels={allLabels} />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(withStyles(s)(Board)));
