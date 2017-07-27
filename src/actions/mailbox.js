import * as GmailActions from './gmail';
import DataLoader from 'dataloader';
import {
  SYNC_MAILBOX_LABEL_REQUEST,
  SYNC_MAILBOX_LABEL_SUCCESS,
  SYNC_MAILBOX_LABEL_FAILURE,
  SYNC_MAILBOX_LABEL_SUCCESS_NO_CHANGE,
  GET_MAILBOX_LABEL_INFO_REQUEST,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  GET_MAILBOX_LABEL_INFO_FAILURE,
  LIST_ALL_LABELS_REQUEST,
  MOVE_CARD,
  MOVE_LIST,
  TOGGLE_DRAGGING,
  UPDATE_USER_CREDENTIALS,
  PARTIAL_SYNC_MAILBOX_REQUEST,
  ADD_LABEL_LANE,
} from '../constants';

export function moveList(lastX, nextX) {
  return { type: MOVE_LIST, lastX, nextX }
}

export function moveCard(lastLabelId, nextLabelId, lastY) {
  return { type: MOVE_CARD, lastLabelId, nextLabelId, lastY }
}

export function toggleDragging(isDragging) {
  return { type: TOGGLE_DRAGGING, isDragging }
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
  let unread = false;
  for (var i = 0; i < emails.length; i++) {
    if (emails[i].labelIds.indexOf('UNREAD') > -1) {
      unread = true;
      break;
    }
  }
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
    unread: unread,
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

function sortAndProcessMessages(messages, labelIds) {
  const messagesTrashed = [];
  const messagesRemovedFromLabels = [];
  const messagesChanged = []; // changed or added
  const messagesDeleted = [];
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].deleted) {
      messagesDeleted.push(messages[i])
    } else {
      let email = formatEmail(messages[i]);
      if (email.labelIds.indexOf('TRASH') > -1 ) {
        // deleted messages
        messagesTrashed.push(email);
      } else {
        if (email.labelIds.some(v => labelIds.indexOf(v) >= 0)) {
          messagesChanged.push(email)
        } else {
          messagesRemovedFromLabels.push(email)
        }
      }
    }
  }
  return { messagesTrashed, messagesChanged, messagesRemovedFromLabels, messagesDeleted }
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

export function requestFetchAllLabels() {
  return { type: LIST_ALL_LABELS_REQUEST }
}

export function fetchAllLabels(user) {
  return GmailActions.fetchAllLabels(user)
}

// export function fetchAllLabelsAction(user) {
//   return async (dispatch) => {
//     if (authNeedsRefresh(user)) {
//       user = await refreshAuth(user);
//       dispatch({ type: UPDATE_USER_CREDENTIALS, user })
//     }
//     dispatch({ type: GET_ALL_MAILBOX_LABELS_START })
//     return GmailActions.fetchAllLabels(user)
//       .then(data => dispatch({ type: GET_ALL_MAILBOX_LABELS_SUCCESS, labels: data.labels }))
//       .catch(err => dispatch({ type: GET_ALL_MAILBOX_LABELS_FAILURE, err }))
//   }
// }

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

export function fetchMultipleLabelInfo(user, labelIds) {
  return GmailActions.fetchMultipleLabelInfo(user, labelIds)
}


function getLatestHistoryId(labelsMap) {
  const historyIds = [];
  for (var key in labelsMap) {
    let threads = labelsMap[key];
    let maxHistoryId = Math.max.apply(Math, threads.map(item => Number(item.historyId)));
    historyIds.push(maxHistoryId)
  }
  return Math.max(...historyIds).toString();
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
      return { latestHistoryId: getLatestHistoryId(labelsMap), labelsMap};
    })
}

export function syncMailBoxLabel(user, label) {
  return (dispatch) => {
    dispatch({ type: SYNC_MAILBOX_LABEL_START, labelId: label.id });
    return GmailActions.fetchHistory(user, label.latestHistoryId)
      .then(data => {

      })
  }
}

export function addLabelLane() {
  return ({ type: ADD_LABEL_LANE })
}

export function requestPartialSyncMailBox() {
  return ({ type: PARTIAL_SYNC_MAILBOX_REQUEST })
}

export function partialSyncMailBox(user, labels, mailbox) {
  // TODO: need to retrieve according to next page token
  // TODO: trigger full sync if fetch history returns 404
  if (!labels.latestHistoryId) { return { requestFullSync: true } }
  return GmailActions.fetchHistory(user, labels.latestHistoryId)
    .then(data => {
      if (data.invalidHistoryId) {
        return { requestFullSync: true }
      }
      if (data.historyId == labels.latestHistoryId) {
        // nothing changed
        return { changed: false }
      }
      if (!data.history) {
        // nothing changed but need to update latestHistoryId
        return { changed: false, latestHistoryId: data.historyId }
      }

      // stuff changed
      const history = data.history;
      const allChangedMessageIds = [];
      for (var i = 0; i < history.length; i++) {
        let changedMessageIds = history[i].messages.map(item => item.id);
        allChangedMessageIds.push.apply(allChangedMessageIds, changedMessageIds)
      }
      // remove duplicates in the list of threadIds
      const allChangedMessageIdsSet = [...new Set(allChangedMessageIds)]
      // fetch and sort, returns a dictionary
      return GmailActions.fetchManyMessages(user, allChangedMessageIdsSet)
        .then(messages => {
          const labelIds = Object.keys(mailbox);
          const { messagesTrashed, messagesChanged, messagesRemovedFromLabels, messagesDeleted } = sortAndProcessMessages(messages, labelIds)
          return { changed: true, latestHistoryId: data.historyId, messagesTrashed, messagesChanged, messagesRemovedFromLabels, messagesDeleted }
        })
    })
}

