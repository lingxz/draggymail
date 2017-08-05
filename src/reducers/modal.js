import { fromJS, Map } from 'immutable';
import {
  OPEN_EMAIL_MODAL,
  CLOSE_EMAIL_MODAL,
} from '../constants';

const initialState = fromJS({
  isOpen: false,
  showing: null,
  item: null,
});

export default function modal(state = initialState, action) {
  switch (action.type) {
    case OPEN_EMAIL_MODAL: {
      return state.withMutations((ctx) => {
        ctx.set('isOpen', true);
        ctx.set('showing', 'email');
        ctx.set('item', fromJS(action.item));
        ctx.set('labelId', action.labelId)
      })
    }
    case CLOSE_EMAIL_MODAL: {
      return state.withMutations((ctx) => {
        ctx.set('isOpen', false);
        ctx.set('showing', null);
        ctx.set('item', null);
      })
    }
    default:
      return state;
  }
}
