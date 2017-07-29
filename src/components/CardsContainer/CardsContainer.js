import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { DropTarget, DragSource } from 'react-dnd';
import Select from 'react-select';
import s from './CardsContainer.css';
import Cards from '../Card';
import rs from 'react-select/dist/react-select.css';

const listSource = {
  beginDrag(props) {
    return {
      id: props.id,
      x: props.x,
    };
  },
  endDrag(props) {
    props.stopScrolling();
  }
};

const listTarget = {
  canDrop() {
    return false;
  },
  hover(props, monitor) {
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
    const { id: listId } = monitor.getItem();
    const { id: nextX } = props;
    if (listId !== nextX) {
      props.moveList(listId, props.x);
    }
  }
};


function collectDropTarget(connectDragSource) {
  return {
    connectDropTarget: connectDragSource.dropTarget(),
  }
}

function collectDragSource(connectDragSource, monitor) {
  return {
    connectDragSource: connectDragSource.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class CardsContainer extends React.Component {

  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    item: PropTypes.object,
    labelId: PropTypes.string.isRequired,
    x: PropTypes.number,
    moveCard: PropTypes.func.isRequired,
    moveList: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    startScrolling: PropTypes.func,
    stopScrolling: PropTypes.func,
    isScrolling: PropTypes.bool,
    allLabels: PropTypes.array,
    requestChangeLabel: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.onLabelChange = this.onLabelChange.bind(this);
  }

  onLabelChange(newLabel) {
    console.log(newLabel);
    const { x, item, requestChangeLabel } = this.props;
    requestChangeLabel(x, item.id, newLabel.value);
  }

	render() {
    const { connectDropTarget, connectDragSource, labelId, item, x, moveCard, isDragging, allLabels } = this.props;
    const threads = item.threads || [];

    // construct options, react select requires options to be in specific format
    const options = [];
    for (var i = 0; i < allLabels.length; i++) {
      options.push({
        value: allLabels[i].id,
        label: allLabels[i].name
      })
    }

	  return connectDragSource(connectDropTarget(
      <div className={s.root}>
        <div className={s.head}>
          <div className={s.name}>
            <div className={s.selectWrapper}>
              <Select
                name="label"
                clearable={false}
                value={item.id}
                options={options}
                onChange={this.onLabelChange}
              />
            </div>
          </div>
        </div>
        <div className={s.items}>
          <Cards
            labelId={labelId}
            moveCard={moveCard}
            item={item}
            x={x}
            cards={threads || []}
            latestUnreadThreads={item.latestUnreadThreads}
            startScrolling={this.props.startScrolling}
            stopScrolling={this.props.stopScrolling}
            isScrolling={this.props.isScrolling}
          />
        </div>
      </div>
    ));
	}
}

export default DropTarget('list', listTarget, collectDropTarget)(DragSource('list', listSource, collectDragSource)(withStyles(rs)(withStyles(s)(CardsContainer))))
