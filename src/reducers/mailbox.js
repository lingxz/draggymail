import { fromJS, Map } from 'immutable';
import {
  CLEAR_MAILBOX,
  SYNC_MAILBOX_LABEL_START,
  SYNC_MAILBOX_LABEL_SUCCESS,
  SYNC_MAILBOX_LABEL_FAILURE,
  GET_MAILBOX_LABEL_INFO_START,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  GET_MAILBOX_LABEL_INFO_FAILURE,
  MOVE_CARD,
} from '../constants';

function getInsertIndexByDate(array, date) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid].date > date) { low = mid + 1; }
        else { high = mid; }
    }
    return low;
}

const initialState = new Map();

export default function mailbox(state = initialState, action) {
  switch (action.type) {
    case MOVE_CARD: {
      const { lastLabelId, nextLabelId, lastY } = action;
      if (lastLabelId === nextLabelId) {
        return state;
      } else {
        const nextLane = state.toJS()[nextLabelId].emails;
        const lastLane = state.toJS()[lastLabelId].emails;

        // move element to new place
        const insertionIndex = getInsertIndexByDate(nextLane, lastLane[lastY].date);
        nextLane.splice(insertionIndex, 0, lastLane[lastY])
        //delete element from old place
        lastLane.splice(lastY, 1);
        return state.withMutations((ctx) => {
          ctx.setIn([lastLabelId, 'emails'], fromJS(lastLane))
          ctx.setIn([nextLabelId, 'emails'], fromJS(nextLane))
        })
      }
    }
    case MOVE_CARD: {
      const newLists = [...state.toJS().lists];
      const { lastLabelId, nextLabelId } = action;
      const { lastX, lastY, nextX, nextY } = action;
      if (lastX === nextX) {
        newLists[lastX].cards.splice(nextY, 0, newLists[lastX].cards.splice(lastY, 1)[0]);
      } else {
        // move element to new place
        newLists[nextX].cards.splice(nextY, 0, newLists[lastX].cards[lastY]);
        // delete element from old place
        newLists[lastX].cards.splice(lastY, 1);
      }
      return state.withMutations((ctx) => {
        ctx.set('lists', fromJS(newLists));
      });
    }
    case SYNC_MAILBOX_LABEL_START:
      return state.setIn([action.labelId, 'isFetching'], true)
    case SYNC_MAILBOX_LABEL_FAILURE:
      return state.setIn([action.labelId, 'isFetching'], false)
    case SYNC_MAILBOX_LABEL_SUCCESS:
      return state.withMutations((ctx) =>  {
        ctx.setIn([action.labelId, 'isFetching'], false)
        ctx.setIn([action.labelId, 'emails'], fromJS(action.emails))
      })
    case GET_MAILBOX_LABEL_INFO_START:
      return state.setIn([action.labelId, 'isFetching'], true)
    case GET_MAILBOX_LABEL_INFO_FAILURE:
      return state.setIn([action.labelId, 'isFetching'], false)
    case GET_MAILBOX_LABEL_INFO_SUCCESS:
      return state.withMutations((ctx) => {
        ctx.setIn([action.labelId, 'id'], action.payload.id)
          .setIn([action.labelId, 'name'], action.payload.name)
          .setIn([action.labelId, 'type'], action.payload.type)
          .setIn([action.labelId, 'messagesTotal'], action.payload.messagesTotal)
          .setIn([action.labelId, 'messagesUnread'], action.payload.messagesUnread)
          .setIn([action.labelId, 'threadsTotal'], action.payload.threadsTotal)
          .setIn([action.labelId, 'threadsUnread'], action.payload.threadsUnread)
          .setIn([action.labelId, 'isFetching'], false)
      });
      return state;
    default:
      return state;
  }
}

// export default function mailbox(state = initialState, action) {
//   switch (action.type) {
//     case SET_MAILBOX:
//       return fromJS(action.payload.mailbox);
//     case CLEAR_MAILBOX:
//       return null;
//     case SET_GOOGLE_LABEL_INFO:
//       return state.set('gmail', fromJS(action.info))
//     case SET_GOOGLE_LATEST_UNREAD_THREADS:
//       return state.withMutations((ctx) => {
//         ctx.set('threadList', fromJS(action.payload.threadList))
//             .set('fetchedThreads', fromJS(action.payload.fetchedThreads))
//             .set('resultSizeEstimate', fromJS(action.payload.resultSizeEstimate))
//       });
//     case SET_GOOGLE_AUTH:
//       return state.set('googleAuth', fromJS(action.payload.auth))

//     // case SYNC_MAILBOX_PROFILE:
//     //   return state.set('isSyncing', true)
//     // case SYNC_MAILBOX_PROFILE_SUCCESS:
//     //   return state.set('isSyncing', false)
//     // case SYNC_MAILBOX_PROFILE_FAILURE:
//     //   return state.withMutations((ctx) => {
//     //     ctx.set('isSyncing', false)
//     //         .set('err', action.err);
//     //   });
//     default:
//       return state;
//   }
// }

