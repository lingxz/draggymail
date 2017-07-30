import React from 'react';
import PropTypes from "prop-types";
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import Card from './Card';

function getStyles(isDragging) {
  return {
    display: isDragging ? 0.5 : 1
  };
}

const cardSource = {
  beginDrag(props, monitor, component) {
    // dispatch to redux store that drag is started
    const { item, labelId, x, y } = props;
    const { id, title } = item;
    const { clientWidth, clientHeight } = findDOMNode(component);

    return { id, title, labelId, item, x, y, clientWidth, clientHeight };
  },
  // endDrag(props, monitor) {
  //   document.getElementById(monitor.getItem().id).style.display = 'block';
  //   props.stopScrolling();
  // },
  isDragging(props, monitor) {
    const isDragging = props.item && props.item.id === monitor.getItem().id;
    return isDragging;
  }
};

function collectDragSource(connectDragSource, monitor) {
  return {
    connectDragSource: connectDragSource.dragSource(),
    connectDragPreview: connectDragSource.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

class DraggableCard extends React.Component {

  static propTypes = {
    labelId: PropTypes.string.isRequired,
    item: PropTypes.object,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    triggerEmailModal: PropTypes.func,
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    });
  }

	render() {
		const { isDragging, connectDragSource, item } = this.props;

		return connectDragSource(
  		<div>
        <Card style={getStyles(isDragging)} triggerEmailModal={this.props.triggerEmailModal} item={item}/>
      </div>
		)
	}
}

export default DragSource('card', cardSource, collectDragSource)(DraggableCard);
