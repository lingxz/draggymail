import { fromJS, Map } from 'immutable';
import {
  OPEN_LABEL_SELECTOR,
  TOGGLE_LABEL_SELECTOR,
  CLOSE_LABEL_SELECTOR,
  OPEN_EMAIL_MODAL,
  EDIT_LABELS_REQUEST,
} from '../constants';

const initialState = fromJS({
  isOpen: false,
  threadId: null,
  thread: null,
  currentBoard: null,
  x: null,
  y: null,
  selectedLabels: null,
});

export default function labelSelector(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_LABEL_SELECTOR: {
      if (state.toJS().isOpen === false) {
        return state.withMutations((ctx) => {
          ctx.set('isOpen', true);
          ctx.set('threadId', action.threadId);
          ctx.set('thread', action.thread);
          ctx.set('currentBoard', action.currentBoard)
          ctx.set('x', action.x);
          ctx.set('y', action.y);
          ctx.set('selectedLabels', fromJS(action.selectedLabels))
        })
      } else {
        return initialState;
      }
    }
    case OPEN_LABEL_SELECTOR: {
      return state.withMutations((ctx) => {
        ctx.set('isOpen', true);
        ctx.set('threadId', action.threadId);
        ctx.set('thread', action.thread);
        ctx.set('currentBoard', action.currentBoard);
        ctx.set('x', action.x);
        ctx.set('y', action.y);
        ctx.set('selectedLabels', fromJS(action.selectedLabels))
      })
    }
    case OPEN_EMAIL_MODAL:
      return initialState;
    case CLOSE_LABEL_SELECTOR:
      return initialState;
    case EDIT_LABELS_REQUEST: {
      // remove labels first before adding
      return state.set('selectedLabels', fromJS(action.newLabelsList))
    }
    default:
      return state;
  }
}
