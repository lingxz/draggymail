import { Record, List, fromJS } from 'immutable';

import {
  GET_LISTS,
  GET_LISTS_START,
  MOVE_CARD,
  MOVE_LIST,
  TOGGLE_DRAGGING,
  GET_ALL_MAILBOX_LABELS_START,
  GET_ALL_MAILBOX_LABELS_SUCCESS,
  GET_ALL_MAILBOX_LABELS_FAILURE,
  UPDATE_HISTORY_ID,
} from '../constants';


const initialState = fromJS({
  allLabels: [],
  isFetching: false,
  isDragging: false,
  labelsToShow: ['INBOX', 'Label_203'],
})
/* eslint-enable new-cap */
// const initialState = new InitialState;
export default function labels(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_MAILBOX_LABELS_START:
      return state.set('isFetching', true)
    case GET_ALL_MAILBOX_LABELS_SUCCESS:
      return state.set('allLabels', fromJS(action.labels))
    case GET_ALL_MAILBOX_LABELS_FAILURE:
      return state.set('isFetching', false)
    case UPDATE_HISTORY_ID: {
      const currentHistoryId = state.toJS().latestHistoryId || '';
      if (action.latestHistoryId > currentHistoryId) {
        return state.set('latestHistoryId', action.latestHistoryId)
      } else {
        return state;
      }
    }
    case MOVE_LIST: {
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

