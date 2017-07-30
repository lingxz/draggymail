import { Record, List, fromJS } from 'immutable';

import {
  MOVE_CARD,
  MOVE_LABEL,
  TOGGLE_DRAGGING,
  UPDATE_HISTORY_ID,
  LIST_ALL_LABELS_REQUEST,
  LIST_ALL_LABELS_SUCCESS,
  LIST_ALL_LABELS_FAILURE,
  ADD_LABEL_TO_SHOW,
  UPDATE_LABELS_TO_SHOW,
  CHANGE_LABEL_TO_SHOW_SUCCESS,
  REMOVE_LABEL_TO_SHOW,
  REMOVE_LABEL_TO_SHOW_SUCCESS,
} from '../constants';


const initialState = fromJS({
  allLabels: [],
  isFetching: false,
  isDragging: false,
  labelsToShow: [],
})
/* eslint-enable new-cap */
// const initialState = new InitialState;
export default function labels(state = initialState, action) {
  switch (action.type) {
    case REMOVE_LABEL_TO_SHOW_SUCCESS: {
      const labelsToShow = state.toJS().labelsToShow;
      labelsToShow.splice(action.position, 1)
      return state.set('labelsToShow', fromJS(labelsToShow))
    }
    case CHANGE_LABEL_TO_SHOW_SUCCESS: {
      const labelsToShow = state.toJS().labelsToShow;
      labelsToShow[action.position] = action.newLabelId;
      return state.set('labelsToShow', fromJS(labelsToShow))
    }
    case UPDATE_LABELS_TO_SHOW:
      return state.set('labelsToShow', fromJS(action.labels))
    case ADD_LABEL_TO_SHOW: {
      const newLabelsToShow = state.toJS().labelsToShow;
      if (newLabelsToShow.length !== 0) {
        newLabelsToShow.push(newLabelsToShow[0])
      } else {
        newLabelsToShow.push('INBOX')
      }
      return state.set('labelsToShow', fromJS(newLabelsToShow))
    }
    case LIST_ALL_LABELS_REQUEST:
      return state;
    case LIST_ALL_LABELS_SUCCESS:
      return state.set('allLabels', fromJS(action.labels));
    case LIST_ALL_LABELS_FAILURE:
      return state;
    case UPDATE_HISTORY_ID: {
      const currentHistoryId = state.toJS().latestHistoryId || '';
      if (action.latestHistoryId > currentHistoryId) {
        return state.set('latestHistoryId', action.latestHistoryId)
      } else {
        return state;
      }
    }
    case MOVE_LABEL: {
      const newLabelsToShow = [...state.toJS().labelsToShow];
      const { lastX, nextX } = action;
      const t = newLabelsToShow.splice(lastX, 1)[0];

      newLabelsToShow.splice(nextX, 0, t);

      return state.withMutations((ctx) => {
        ctx.set('labelsToShow', fromJS(newLabelsToShow));
      });
    }
    case TOGGLE_DRAGGING: {
      return state.set('isDragging', action.isDragging);
    }
    default:
      return state;
  }
}

