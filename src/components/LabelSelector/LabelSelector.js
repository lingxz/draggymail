import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Select from 'react-select';
import s from './LabelSelector.css';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as MailBoxActions from '../../actions/mailbox';
import * as LabelSelectorActions from '../../actions/labelSelector';

function mapStateToProps(state) {
  const jsState = state.toJS();
  return {
    isOpen: jsState.labelSelector.isOpen,
    threadId: jsState.labelSelector.threadId,
    thread: jsState.labelSelector.thread,
    x: jsState.labelSelector.x,
    y: jsState.labelSelector.y,
    currentBoard: jsState.labelSelector.currentBoard,
    user: jsState.user,
    selectedLabels: jsState.labelSelector.selectedLabels,
    allLabels: jsState.labels.allLabels,
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({...LabelSelectorActions, ...MailBoxActions}, dispatch);
}

class LabelSelector extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    threadId: PropTypes.string,
    user: PropTypes.object,
    x: PropTypes.number,
    y: PropTypes.number,
    selectedLabels: PropTypes.array,
    allLabels: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this._handleChangeLabels = this._handleChangeLabels.bind(this);
    this._handleOnBlur = this._handleOnBlur.bind(this);
  }

  _handleOnBlur(e) {
    console.log("blur!!!!");
  }

  _handleChangeLabels(labelsChosen) {
    const chosen = labelsChosen.map(l => l.value)
    const { requestEditLabels, threadId, thread, currentBoard, isOpen, selectedLabels: currentLabels } = this.props;
    if (!isOpen) { return; }
    if (currentLabels.length === labelsChosen) {
      // no change.
      // TODO: need a stricter check
      return
    }
    if (currentLabels.length > labelsChosen.length) {
      // label was removed
      const removed = currentLabels.filter(x => chosen.indexOf(x) === -1);
      requestEditLabels(threadId, thread, [], removed, chosen, currentBoard)
      return;
    } else if (currentLabels.length < labelsChosen.length) {
      // label was added
      const added = chosen.filter(x => currentLabels.indexOf(x) === -1);
      requestEditLabels(threadId, thread, added, [], chosen, currentBoard);
      return;
    }
  }

  render() {
    const { isOpen, x, y, selectedLabels, allLabels, closeLabelSelector } = this.props;

    const options = [];
    for (var i = 0; i < allLabels.length; i++) {
      let item = {
        value: allLabels[i].id,
        label: allLabels[i].name,
        clearableValue: true,
      }
      options.push(item);
    }

    const style = {
      left: x - 300,
      top: y + 15,
    };
    return (
        <div autoFocus style={style} onBlur={closeLabelSelector} className={isOpen ? s.root: s.hidden}>
          {isOpen &&
            <Select
              autofocus={true}
              name="form-field-name"
              value={selectedLabels}
              options={options}
              multi={true}
              onChange={this._handleChangeLabels}
            />
          }
        </div>
      )

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(s)(LabelSelector));
