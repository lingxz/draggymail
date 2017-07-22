import { fromJS, Map } from 'immutable';
import {
  CLEAR_MAILBOX,
  SYNC_MAILBOX_LABEL_START,
  SYNC_MAILBOX_LABEL_SUCCESS,
  SYNC_MAILBOX_LABEL_FAILURE,
  SYNC_MAILBOX_LABEL_SUCCESS_NO_CHANGE,
  SYNC_MAILBOX_LATEST_UNREAD_THREADS,
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
        const lastLabel = state.toJS()[lastLabelId];
        const nextLabel = state.toJS()[nextLabelId];

        const nextLane = nextLabel.threads;
        const lastLane = lastLabel.threads;

        // move element to new place
        const insertionIndex = getInsertIndexByDate(nextLane, lastLane[lastY].date);
        const threadToMove = lastLane[lastY];

        // remove label from element and add new one
        const threadLabels = threadToMove.labelIds
        const index = threadLabels.indexOf(lastLabelId)
        if (index > -1) {
          threadLabels.splice(index, 1)
        }
        threadLabels.push(nextLabelId);
        threadToMove.labelIds = threadLabels;

        //TODO: need to remove and add label to each email as well

        nextLane.splice(insertionIndex, 0, threadToMove)
        //delete element from old place
        lastLane.splice(lastY, 1);
        return state.withMutations((ctx) => {
          ctx.setIn([lastLabelId, 'threads'], fromJS(lastLane))
          ctx.setIn([lastLabelId, 'messagesTotal'], lastLabel.messagesTotal - 1)
          ctx.setIn([nextLabelId, 'threads'], fromJS(nextLane))
          ctx.setIn([nextLabelId, 'messagesTotal'], nextLabel.messagesTotal + 1)
        })
      }
    }
    case SYNC_MAILBOX_LABEL_START:
      return state.setIn([action.labelId, 'isFetching'], true)
    case SYNC_MAILBOX_LABEL_FAILURE:
      return state.setIn([action.labelId, 'isFetching'], false)
    case SYNC_MAILBOX_LABEL_SUCCESS: {
      if (!action.threads) {
        return state.withMutations((ctx) => {
          ctx.setIn([action.labelId, 'isFetching'], false)
        })
      }
      return state.withMutations((ctx) =>  {
        ctx.setIn([action.labelId, 'isFetching'], false)
        ctx.setIn([action.labelId, 'threads'], fromJS(action.threads))
        ctx.setIn([action.labelId, 'latestUnreadThreads'], fromJS(action.latestUnreadThreads || []))
      })
    }
    case SYNC_MAILBOX_LABEL_SUCCESS_NO_CHANGE:
      return state.setIn([action.labelId, 'isFetching'], false)
    case SYNC_MAILBOX_LATEST_UNREAD_THREADS: {
      const changedThreadIds = action.threads.map(item => item.id)
      const currentThreadList = state.get(action.labelId).get('threads');

      let newThreadList = currentThreadList;
      for (var i = 0; i < changedThreadIds.length; i++) {
        let changedIndex = newThreadList.findIndex((item) => {
          return item.get('id') === changedThreadIds[i]
        })
        let changedThread = action.threads.filter((thrd) => {
          return thrd.id === changedThreadIds[i]
        })[0];
        newThreadList = newThreadList.update(changedIndex, item => fromJS(changedThread))
      }

      return state.withMutations((ctx) => {
        ctx.setIn([action.labelId, 'latestUnreadThreads'], action.threads)
        ctx.setIn([action.labelId, 'threads'], newThreadList)
      })
    }
    case GET_MAILBOX_LABEL_INFO_START:
      return state.setIn([action.labelId, 'isFetching'], true)
    case GET_MAILBOX_LABEL_INFO_FAILURE:
      return state.setIn([action.labelId, 'isFetching'], false)
    case GET_MAILBOX_LABEL_INFO_SUCCESS: {
      if (!action.payload) {
        return state.setIn([action.labelId, 'isFetching'], false)
      }
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
    }
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

