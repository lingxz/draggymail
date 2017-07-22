import {
  CLEAR_MAILBOX,
  // SYNC_MAILBOX_PROFILE,
  // SYNC_MAILBOX_PROFILE_SUCCESS,
  // SYNC_MAILBOX_PROFILE_FAILURE,
  SET_GOOGLE_LABEL_INFO,
  SET_GOOGLE_LATEST_UNREAD_THREADS,
  SET_GOOGLE_AUTH,
  SET_MAILBOX,
} from '../constants';
import * as GmailFetch from '../data/gmailfetch';

export function setGoogleAuth(auth) {
  return dispatch => {
    dispatch({ type: SET_GOOGLE_AUTH, payload: { auth: auth }})
  }
}

export function setGoogleLabel(info) {
  return dispatch => {
    dispatch({ type: SET_GOOGLE_LABEL_INFO, info: info })
  }
}

export function setGoogleLatestUnreadThreads(threadList, resultSizeEstimate, fetchedThreads) {
  return dispatch => {
    const payload = {
      id: id,
      threadList: threadList,
      resultSizeEstimate:resultSizeEstimate,
      fetchedThreads: fetchedThreads,
    }
    dispatch({ type: SET_GOOGLE_LATEST_UNREAD_THREADS, payload })
  }
}

export function clearMailbox() {
  return dispatch => {
    dispatch({ type: CLEAR_MAILBOX })
  }
}

export function setMailBox(mailbox) {
  return dispatch => {
    dispatch({ type: SET_MAILBOX, payload: { mailbox: mailbox }})
  }
}

export function syncLabel(auth, label, forceFullSync) {
  return dispatch => {
    return syncMailBoxLabel(auth, label, forceFullSync)
  }
}


export function syncMailBoxLabel(auth, label, forceFullSync) {
  // call out to google
  const labelId = label.id;
  const messagesTotal = label.messagesTotal
  GmailFetch.fetchMailBoxLabel(auth, labelId)
    .then(({ response }) => {
      // update model, decide if we changed
      dispatch(setGoogleLabelInfo(response))
      return Promise.resolve({
        changed: forceFullSync || messagesTotal !== response.messagesTotal,
      })
    })
    .then(({ changed }) => {
      if (!changed) { return Promise.resolve() };
      return Promise.resolve()
        .then(() => {
          return GmailFetch.fetchThreadIds(auth, '')
        })
        .then(({ response }) => {
          // Step 2.3: find the changed threads
          const threads = response.threads || [];
          const currentThreadsIndex = label.latestUnreadThreads.reduce((acc, thread) => {
            acc[thread.id] = thread
            return acc
          }, {})

          const changedThreads = threads.reduce((acc, thread) => {
            if (!currentThreadsIndex[thread.id]) {
              acc.push(thread)
            } else if (currentThreadsIndex[thread.id].historyId !== thread.historyId) {
              acc.push(thread)
            } else if ((currentThreadsIndex[thread.id].messages || []).length === 0) {
              acc.push(thread)
            }
            return acc
          }, [])

          return { threads: threads, changedThreads: changedThreads, resultSizeEstimate: response.resultSizeEstimate }
        })
    })
    .then(({threads, changedThreads, resultSizeEstimate}) => {
      if (changedThreads.length !== 0) {
        const changedIndexed = changedThreads.reduce((acc, thread) => {
          thread.messages = (thread.messages || []).map((message) => {
            return {
              id: message.id,
              threadId: message.threadId,
              historyId: message.historyId,
              internalDate: message.internalDate,
              snippet: message.snippet,
              labelIds: message.labelIds,
              payload: {
                headers: message.payload.headers.filter((header) => {
                  const name = header.name.toLowerCase()
                  return name === 'subject' || name === 'from' || name === 'to'
                })
              }
            }
          })
          acc[thread.id] = thread
          return acc
        }, {})
        dispatch(setGoogleLatestUnreadThreads(threads, changedIndexed))
        return { threads: threads, changedIndex: changedIndexed }
      } else {
        dispatch(setGoogleLatestUnreadThreads(threads, changedIndexed))
        return { threads: threads, changedIndex: {} }
      }
    })
}
