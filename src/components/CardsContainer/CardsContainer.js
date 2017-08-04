import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { DropTarget, DragSource } from 'react-dnd';
import Select from 'react-select';
import rs from 'react-select/dist/react-select.css';
import s from './CardsContainer.css';
import Cards from '../Card';

const listSource = {
  beginDrag(props) {
    return {
      id: props.labelId,
      x: props.x,
    };
  },
};

const listTarget = {
  // canDrop() {
  //   return false;
  // },
  drop(props, monitor, component) {
    // document.getElementById(monitor.getItem().id).style.display = 'block';

    const { x: lastX } = monitor.getItem();
    const { x: nextX } = props;
    if (lastX !== nextX) {
      props.moveLabel(lastX, nextX);
    }
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
    const { x: lastX } = monitor.getItem();
    const { x: nextX } = props;
    // if (lastX !== nextX) {
    //   props.moveLabel(lastX, nextX);
    // }
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
    moveLabel: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    startScrolling: PropTypes.func,
    stopScrolling: PropTypes.func,
    isScrolling: PropTypes.bool,
    allLabels: PropTypes.array,
    requestChangeLabel: PropTypes.func.isRequired,
    requestRemoveLabel: PropTypes.func.isRequired,
    triggerEmailModal: PropTypes.func,
    markAsRead: PropTypes.func,
    archiveThread: PropTypes.func,
    trashThread: PropTypes.func,
    renameLabel: PropTypes.func,
    createLabel: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.onLabelChange = this.onLabelChange.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this._handleClickLabel = this._handleClickLabel.bind(this);
    this._handleOnBlur = this._handleOnBlur.bind(this);
    this._handleRenameLabel = this._handleRenameLabel.bind(this);
    this._handleCreateLabel = this._handleCreateLabel.bind(this);
    this._startRenameLabel = this._startRenameLabel.bind(this);
    this._startCreateLabel = this._startCreateLabel.bind(this);
    this.state = {
      showSelectable: false,
      showCreateLabelBox: false,
      showEditLabelBox: false,
    }
  }

  _handleClickLabel() {
    this.setState({ showSelectable: true })
  }

  _handleOnBlur() {
    this.setState({ showSelectable: false, showEditLabelBox: false, showCreateLabelBox: false })
  }

  onLabelChange(newLabel) {
    const { x, item, requestChangeLabel } = this.props;
    requestChangeLabel(x, item.id, newLabel.value);
  }

  handleCloseClick() {
    const { requestRemoveLabel, x } = this.props;
    requestRemoveLabel(x);
  }

  _startRenameLabel() {
    this.setState({ showEditLabelBox: true })
  }

  _startCreateLabel() {
    this.setState({ showCreateLabelBox: true })
  }

  _handleRenameLabel(e) {
    e.preventDefault();
    const newLabelName = this.editBox.value;
    if (!(newLabelName === this.props.item.name) && newLabelName) {
      console.log("this is new name!!!");
      console.log(newLabelName);
      this.props.renameLabel(this.props.item.id, newLabelName)
    }
    this._handleOnBlur();
  }

  _handleCreateLabel(e) {
    e.preventDefault();
    const newLabelName = this.createBox.value;
    if (newLabelName) {
      this.props.createLabel(newLabelName, this.props.x);
    }
    this._handleOnBlur();
  }

	render() {
    const { connectDropTarget, connectDragSource, labelId, item, x, moveCard, isDragging, allLabels } = this.props;
    const { showSelectable, showEditLabelBox, showCreateLabelBox } = this.state;
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
            {showSelectable &&
              <div onBlur={this._handleOnBlur} className={s.selectWrapper}>
                <Select
                  autofocus
                  name="label"
                  clearable={false}
                  value={item.id}
                  options={options}
                  onChange={this.onLabelChange}
                />
              </div>
            }
            {showEditLabelBox &&
              <form onSubmit={this._handleRenameLabel}>
                <input
                  autoFocus
                  className={s.editBox}
                  onBlur={this._handleOnBlur}
                  type="text"
                  defaultValue={item.name}
                  ref={el => this.editBox = el}
                />
              </form>
            }
            {showCreateLabelBox &&
              <form onSubmit={this._handleCreateLabel}>
                <input
                  autoFocus
                  className={s.editBox}
                  onBlur={this._handleOnBlur}
                  type="text"
                  defaultValue={item.name}
                  ref={el => this.createBox = el}
                />
              </form>
            }
            {!showSelectable && !showEditLabelBox && !showCreateLabelBox &&
              <div>
                <div className={s.notSelectableName}>
                  <span onClick={this._handleClickLabel}>{item.name}</span>
                  <span className={s.labelButtons}>
                    <i title="Edit label name" className="fa fa-pencil" onClick={this._startRenameLabel} aria-hidden="true"></i>
                    <i title="Create new label" className="fa fa-plus" onClick={this._startCreateLabel} aria-hidden="true"></i>
                  </span>
                </div>
              </div>
            }
            <div className={s.close} onClick={this.handleCloseClick}></div>
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
            triggerEmailModal={this.props.triggerEmailModal}
            markAsRead={this.props.markAsRead}
            archiveThread={this.props.archiveThread}
            trashThread={this.props.trashThread}
          />
        </div>
      </div>
    ));
	}
}

export default DropTarget('list', listTarget, collectDropTarget)(DragSource('list', listSource, collectDragSource)(withStyles(rs)(withStyles(s)(CardsContainer))))
