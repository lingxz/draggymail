import { fromJS, Map } from 'immutable';
import {
  CLEAR_MAILBOX,
  // SYNC_MAILBOX_PROFILE,
  // SYNC_MAILBOX_PROFILE_SUCCESS,
  // SYNC_MAILBOX_PROFILE_FAILURE,
  // SET_GOOGLE_LABEL_INFO,
  // SET_GOOGLE_LATEST_UNREAD_THREADS,
  // SET_GOOGLE_AUTH,
  // SET_MAILBOX,
  SYNC_MAILBOX_LABEL_START,
  SYNC_MAILBOX_LABEL_SUCCESS,
  SYNC_MAILBOX_LABEL_FAILURE,
  GET_MAILBOX_LABEL_INFO_START,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  GET_MAILBOX_LABEL_INFO_FAILURE,
} from '../constants';

const initialState = new Map();

export default function mailbox(state = initialState, action) {
  switch (action.type) {
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

