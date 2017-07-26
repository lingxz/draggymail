import React from 'react';
import PropTypes from "prop-types";
import { findDOMNode } from 'react-dom';
import { DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Card from './DraggableCard';
import s from './Cards.css';
import { CARD_HEIGHT, CARD_MARGIN, OFFSET_HEIGHT } from '../../constants';

function getPlaceholderIndex(y, scrollY) {
  // shift placeholder if y position more than card height / 2
  const yPos = y - OFFSET_HEIGHT + scrollY;
  let placeholderIndex;
  if (yPos < CARD_HEIGHT / 2) {
    placeholderIndex = -1; // place at the start
  } else {
    placeholderIndex = Math.floor((yPos - CARD_HEIGHT / 2) / (CARD_HEIGHT + CARD_MARGIN));
  }
  return placeholderIndex;
}

const specs = {
  drop(props, monitor, component) {
    document.getElementById(monitor.getItem().id).style.display = 'block';
    const lastY = monitor.getItem().y;

    const lastLabelId = monitor.getItem().labelId;
    const nextLabelId = props.labelId;

    if (lastLabelId === nextLabelId) { // if no move
      return;
    }
    props.moveCard(lastLabelId, nextLabelId, lastY);
  },
  hover(props, monitor, component) {
    // defines where placeholder is rendered
    const placeholderIndex = getPlaceholderIndex(
      monitor.getClientOffset().y,
      findDOMNode(component).scrollTop
    );

    // horizontal scroll
    if (!props.isScrolling) {
      if (window.innerWidth - monitor.getClientOffset().x < 200) {
        props.startScrolling('toRight');
      } else if (monitor.getClientOffset().x < 200) {
        props.startScrolling('toLeft');
      }
    } else {
      if (window.innerWidth - monitor.getClientOffset().x > 200 &&
          monitor.getClientOffset().x > 200
      ) {
        props.stopScrolling();
      }
    }

    // IMPORTANT!
    // HACK! Since there is an open bug in react-dnd, making it impossible
    // to get the current client offset through the collect function as the
    // user moves the mouse, we do this awful hack and set the state (!!)
    // on the component from here outside the component.
    // https://github.com/gaearon/react-dnd/issues/179
    component.setState({ placeholderIndex });

    // when drag begins, we hide the card and only display cardDragPreview
    const item = monitor.getItem();
    document.getElementById(item.id).style.display = 'none';
  }
};

function collect(connectDragSource, monitor) {
  return {
    connectDropTarget: connectDragSource.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    item: monitor.getItem()
  };
}

class Cards extends React.Component {

  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    moveCard: PropTypes.func.isRequired,
    cards: PropTypes.array.isRequired,
    labelId: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    isOver: PropTypes.bool,
    item: PropTypes.object,
    latestUnreadThreads: PropTypes.array,
    canDrop: PropTypes.bool,
    startScrolling: PropTypes.func,
    stopScrolling: PropTypes.func,
    isScrolling: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      placeholderIndex: undefined,
      isScrolling: false,
    };
  }

  render() {
    const { connectDropTarget, x, cards, labelId, isOver, canDrop } = this.props;
    // const { placeholderIndex } = this.state;
    return connectDropTarget(
      <div className={s.root}>
        {cards.map((item, i) =>
          <Card
            labelId={labelId}
            x={x}
            y={i}
            item={item}
            key={item.id}
            stopScrolling={this.props.stopScrolling}
          />
        )}
      </div>
    );
  }
}

export default DropTarget('card', specs, collect)(withStyles(s)(Cards));
