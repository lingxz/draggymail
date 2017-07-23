import * as GmailActions from './gmail';
import DataLoader from 'dataloader';
import {
  SYNC_MAILBOX_LABEL_START,
  SYNC_MAILBOX_LABEL_SUCCESS,
  SYNC_MAILBOX_LABEL_FAILURE,
  SYNC_MAILBOX_LABEL_SUCCESS_NO_CHANGE,
  GET_MAILBOX_LABEL_INFO_START,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  GET_MAILBOX_LABEL_INFO_FAILURE,
  SYNC_MAILBOX_LATEST_UNREAD_THREADS,
  GET_LISTS,
  GET_LISTS_START,
  MOVE_CARD,
  MOVE_LIST,
  TOGGLE_DRAGGING,
  GET_ALL_MAILBOX_LABELS_START,
  GET_ALL_MAILBOX_LABELS_SUCCESS,
  GET_ALL_MAILBOX_LABELS_FAILURE,
  UPDATE_USER_CREDENTIALS,
} from '../constants';

export function moveList(lastX, nextX) {
  return (dispatch) => {
    dispatch({ type: MOVE_LIST, lastX, nextX });
  };
}

export function moveCard(lastLabelId, nextLabelId, lastY) {
  return (dispatch) => {
    dispatch({ type: MOVE_CARD, lastLabelId, nextLabelId, lastY });
  };
}

export function toggleDragging(isDragging) {
  return (dispatch) => {
    dispatch({ type: TOGGLE_DRAGGING, isDragging });
  };
}

function getQueryString(params) {
  return Object
    .keys(params)
    .map(k => {
        if (Array.isArray(params[k])) {
            return params[k]
                .map(val => `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`)
                .join('&')
        }

        return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
    })
    .join('&')
}


function getFieldFromPayload(headers, field) {
  for (var i = 0; i < headers.length; i++) {
    var dict = headers[i];
    if (dict.name == field) {
      return dict.value
    }
  }
  return null;
}

export function sortEmails(emails, labels) {
  var labelsMap = labels.reduce((map, obj) => {
    map[obj] = [];
    return map;
  }, {})
  for (var idx = 0; idx < emails.length; idx++) {
    let email = emails[idx];
    let formattedEmail = formatEmail(email);
    for (var labelidx = 0; labelidx < email.labelIds.length; labelidx++) {
      let label = email.labelIds[labelidx];
      if (label in labelsMap) {
        labelsMap[label].push(formattedEmail)
      }
    }
  }
  return labelsMap;
}

export function formatEmail(email) {
  return {
    id: email.id,
    subject: getFieldFromPayload(email.payload.headers, 'Subject'),
    from: getFieldFromPayload(email.payload.headers, 'From'),
    to: getFieldFromPayload(email.payload.headers, 'To'),
    content: email.snippet,
    snippet: email.snippet,
    threadId: email.threadId,
    labelIds: email.labelIds,
    date: email.internalDate,
  }
}

function processEmails(emails) {
  let inbox = [];
  for (var idx = 0; idx < emails.length; idx++) {
    var email = emails[idx];
    inbox.push(formatEmail(email))
  };
  return inbox;
}

function formatThread(thread) {
  const emails = processEmails(thread.messages)
  const latestEmail = emails[emails.length - 1]
  return {
    id: thread.id,
    historyId: thread.historyId,
    date: latestEmail.date,
    to: latestEmail.to,
    from: latestEmail.from,
    snippet: latestEmail.snippet,
    content: latestEmail.content,
    subject: latestEmail.subject,
    labelIds: latestEmail.labelIds,
    emails: emails,
  }
}

function processThreads(threads) {
  const inbox = [];
  for (var idx = 0; idx < threads.length; idx++) {
    var thread = threads[idx];
    inbox.push(formatThread(thread))
  }
  return inbox;
}

export function refreshAuth(user) {
  return GmailActions.refreshToken(user)
    .then(data => {
      const newUser = {
        id: user.id,
        email: user.email,
        accessToken: data.access_token,
        refreshToken: user.refreshToken,
        expiryTime: data.expiryTime,
      }
      return newUser;
    })
}

export function authNeedsRefresh(user) {
  // if expiry is less than one minute away, refresh token
  const currentTime = (new Date()).getTime();
  const timeToExpiry = user.expiryTime - currentTime;
  if (timeToExpiry < 60 * 1000) {
    return true
  } else {
    return false
  }
}

export function fetchAllLabelsAction(user) {
  return async (dispatch) => {
    if (authNeedsRefresh(user)) {
      user = await refreshAuth(user);
      dispatch({ type: UPDATE_USER_CREDENTIALS, user })
    }
    dispatch({ type: GET_ALL_MAILBOX_LABELS_START })
    return GmailActions.fetchAllLabels(user)
      .then(data => dispatch({ type: GET_ALL_MAILBOX_LABELS_SUCCESS, labels: data.labels }))
      .catch(err => dispatch({ type: GET_ALL_MAILBOX_LABELS_FAILURE, err }))
  }
}

export function fullSyncMailBoxLabel(user, label) {
  const params = {
    labelIds: label.id
  }

  const queryString = getQueryString(params);
  return GmailActions.fetchThreadIds(user, "?" + queryString)
    .then(data => {
      let threadIds = [];
      for (var i = 0; i < data.threads.length; i++) {
        messageIds.push(data.threads[i].id)
      }
      return threadIds;
    })
    .then(threadIds => GmailActions.fetchManyThreads(user, threadIds))
    .then(threads => processThreads(threads))
}

export function fullSyncMailBoxLabelAction(user, label) {
  return dispatch => {
    dispatch({ type: SYNC_MAILBOX_LABEL_START, labelId: label.id })
    try {
      return fullSyncMailBoxLabel(user, label)
        .then(threads => dispatch({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: label.id, threads }))
    }
    catch(err) {
      return dispatch({ type: SYNC_MAILBOX_LABEL_FAILURE, labelId: label.id, err })
    }
  }
}

export function fullSyncMultipleLabels(user, labelIds) {
  let allFetches = [];
  for (var i = 0; i < labelIds.length; i++) {
    let param = {
      labelIds: labelIds[i],
    };
    let queryString = getQueryString(param);
    let threadFetch = GmailActions.fetchThreadIds(user, "?" + queryString)
      .then(data => {
        if (data.threads === undefined) { return []; }
        let threadIds = [];
        for (var i = 0; i < data.threads.length; i++) {
          threadIds.push(data.threads[i].id)
        }
        return threadIds;
      })
      .then(threadIds => GmailActions.fetchManyThreads(user, threadIds))
    allFetches.push(threadFetch);
  }
  return Promise.all(allFetches)
    .then(data => {
      const labelsMap = {};
      for (var i = 0; i < data.length; i++) {
        labelsMap[labelIds[i]] = data[i].map(thread => formatThread(thread));
      }
      return labelsMap;
    })
}

export function fullSyncMultipleLabelsAction(user, labelIds) {
  return async (dispatch) => {
    if (authNeedsRefresh(user)) {
      user = await refreshAuth(user);
      dispatch({ type: UPDATE_USER_CREDENTIALS, user })
    }
    for (var idx = 0; idx < labelIds.length; idx++) {
      dispatch({ type: GET_MAILBOX_LABEL_INFO_START, labelId: labelIds[idx] })
    }
    try {
      return GmailActions.fetchMultipleLabelInfo(user, labelIds)
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            let labelInfo = data[i];
            console.log(data[i]);
            dispatch({ type: GET_MAILBOX_LABEL_INFO_SUCCESS, labelId: labelInfo.id, payload: labelInfo })
          }
          for (var idx = 0; idx < labelIds.length; idx++) {
            dispatch({ type: SYNC_MAILBOX_LABEL_START, labelId: labelIds[idx] })
          }
          return fullSyncMultipleLabels(user, labelIds);
        })
        .then(data => {
          for (var key in data) {
            dispatch({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: key, threads: data[key] })
          }
        })
    }
    catch(err) {
      for (var idx = 0; idx < labelIds.length; i++) {
        dispatch({ type: GET_MAILBOX_LABEL_INFO_FAILURE, labelId: labelIds[idx], err })
        dispatch({ type: SYNC_MAILBOX_LABEL_FAILURE, labelId: labelIds[idx], err })
      }
    }
  }
}


export function getMailBoxLabelInfo(user, labelId) {
  return dispatch => {
    dispatch({ type: GET_MAILBOX_LABEL_INFO_START, labelId })
    try {
      return GmailActions.fetchLabelInfo(user, labelId)
        .then(response => dispatch({ type: GET_MAILBOX_LABEL_INFO_SUCCESS, labelId, payload: response }))
    }
    catch(err) {
      return dispatch({ type: GET_MAILBOX_LABEL_INFO_FAILURE, labelId, err })
    }
  }
}

export function syncMailBoxLabel(user, label) {
  return async (dispatch) => {
    if (authNeedsRefresh(user)) {
      user = await refreshAuth(user);
      dispatch({ type: UPDATE_USER_CREDENTIALS, user })
    }
    dispatch({ type: SYNC_MAILBOX_LABEL_START, labelId: label.id })
    const labelId = label.id;
    const messagesTotal = label.messagesTotal;
    const messagesUnread = label.messagesUnread;
    // this is a cheap call to see if anything changed in the label
    dispatch({ type: GET_MAILBOX_LABEL_INFO_START, labelId: label.id })
    return GmailActions.fetchLabelInfo(user, labelId)
      .then(data => {
        // update decide if we changed
        dispatch({ type: GET_MAILBOX_LABEL_INFO_SUCCESS, labelId: label.id, payload: data })
        return messagesTotal !== data.messagesTotal || messagesUnread !== data.messagesUnread
      })
      .then(changed => {
        console.log("changed???");
        console.log(changed);
        if (!changed) {
          return dispatch({ type: SYNC_MAILBOX_LABEL_SUCCESS_NO_CHANGE, labelId: label.id });
        }
        const queryString = 'labelIds=UNREAD&labelIds=' + label.id;
        return GmailActions.fetchThreadIds(user, '?' + queryString)
          .then(data => {
            const threads = data.threads || [];
            if (threads.length === 0) {
              return {
                threads: threads,
                changedThreads: [],
              }
            }
            const latestUnreadThreads = label.latestUnreadThreads || [];
            const currentThreadsIndex = latestUnreadThreads.reduce((map, item) => {
              map[item.id] = item;
              return map;
            }, {});

            // TODO: changed threads need to take into account unread -> read
            // and deleted emails
            let changedThreads = threads.reduce((acc, thread) => {
              if (!currentThreadsIndex[thread.id]) {
                // thread not in the unread list
                acc.push(thread)
              } else if (currentThreadsIndex[thread.id].historyId !== thread.historyId) {
                // thread was previously in unread list but something changed
                acc.push(thread)
              } else if ((currentThreadsIndex[thread.id].messages || []).length === 0) {
                // there are no emails in previously stored thread
                acc.push(thread)
              }
              return acc;
            }, [])
            console.log("changed threads!!!!");
            console.log(changedThreads);
            return { threads: threads, changedThreads: changedThreads }
          })
          .then(({ threads, changedThreads }) => {
            // grab the full threads that were changed
            if (changedThreads.length === 0) {
              // unread threads didn't change, but something changed inside the threads
              // ????? idk anymore
              return { threads: threads, changedThreads: [] }
            }
            const changedThreadIds = changedThreads.map(thread => thread.id)
            return GmailActions.fetchManyThreads(user, changedThreadIds)
              .then(changedThreads => {
                return { threads: threads, changedThreads: changedThreads }
              })
          })
          .then(({ threads, changedThreads }) => {
            // store the grabbed threads
            if (changedThreads.length === 0) {
              return dispatch({ type: SYNC_MAILBOX_LATEST_UNREAD_THREADS, labelId: label.id, threads: []})
            }
            console.log("latest unread threads!!!");
            dispatch({ type: SYNC_MAILBOX_LATEST_UNREAD_THREADS, labelId: label.id, threads: processThreads(changedThreads) });
            return changedThreads;
          })
      })
      .then(response => dispatch({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: label.id }))
      .catch(err => {
        console.log("error!!!!");
        console.log(err);
        dispatch({ type: SYNC_MAILBOX_LABEL_FAILURE, labelId: label.id, err })
      })
  }
}
