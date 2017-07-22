import { Record, List, fromJS } from 'immutable';

import {
  GET_LISTS,
  GET_LISTS_START,
  MOVE_CARD,
  MOVE_LIST,
  TOGGLE_DRAGGING
} from '../actions/lists';

/* eslint-disable new-cap */
// const InitialState = Record({
//   isFetching: false,
//   lists: List(),
//   isDragging: false
// });

const initialState = fromJS({
  allLabels: [],
  isDragging: false,
  labelsToShow: ['INBOX', 'Label_203'],
})
/* eslint-enable new-cap */
// const initialState = new InitialState;
export default function labels(state = initialState, action) {
  switch (action.type) {
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

