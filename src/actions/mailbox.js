import * as GmailActions from './gmail';
import DataLoader from 'dataloader';
import base64 from 'base-64';
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
  MOVE_LABEL,
  TOGGLE_DRAGGING,
  UPDATE_USER_CREDENTIALS,
  PARTIAL_SYNC_MAILBOX_REQUEST,
  ADD_LABEL_TO_SHOW,
  UPDATE_LABELS_TO_SHOW,
  CHANGE_LABEL_TO_SHOW,
  REMOVE_LABEL_TO_SHOW,
  REMOVE_LABEL_TO_SHOW_SUCCESS,
  REMOVE_LABEL_TO_SHOW_FAILURE,
  OPEN_EMAIL_MODAL,
  MARK_AS_READ_REQUEST,
  ARCHIVE_THREAD_REQUEST,
  TRASH_THREAD_REQUEST,
  CREATE_LABEL_REQUEST,
  RENAME_LABEL_REQUEST,
} from '../constants';

const b64Decode = base64.decode;

export function moveLabel(lastX, nextX) {
  return { type: MOVE_LABEL, lastX, nextX }
}

export function moveCard(lastLabelId, nextLabelId, threadId) {
  return { type: MOVE_CARD, lastLabelId, nextLabelId, threadId }
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

/**
 * Decodes a url safe Base64 string to its original representation.
 * @param  {string} string
 * @return {string}
 */
function urlB64Decode(string) {
  return string
   ? decodeURIComponent(escape(b64Decode(string.replace(/\-/g, '+').replace(/\_/g, '/'))))
   : '';
}

function indexHeaders(headers) {
  if (!headers) {
    return {};
  } else {
    return headers.reduce(function (result, header) {
      result[header.name.toLowerCase()] = header.value;
      return result;
    }, {});
  }
}

// taken from https://github.com/emiltholin/gmail-api-parse-message

export function formatEmail(email) {
  const result = {
    id: email.id,
    snippet: email.snippet,
    threadId: email.threadId,
    labelIds: email.labelIds,
    date: email.internalDate,
  };

  let headers = indexHeaders(email.payload.headers);
  result.headers = headers;

  let parts = [email.payload];
  let firstPartProcessed = false;
  while (parts.length !== 0) {
    let part = parts.shift();
    if (part.parts) {
      parts = parts.concat(part.parts);
    }
    if (firstPartProcessed) {
      headers = indexHeaders(part.headers);
    }

    var isHtml = part.mimeType && part.mimeType.indexOf('text/html') !== -1;
    var isPlain = part.mimeType && part.mimeType.indexOf('text/plain') !== -1;
    var isAttachment = headers['content-disposition'] && headers['content-disposition'].indexOf('attachment') !== -1;

    if (isHtml && !isAttachment) {
      result.textHtml = urlB64Decode(part.body.data);
    } else if (isPlain && !isAttachment) {
      result.textPlain = urlB64Decode(part.body.data);
    } else if (isAttachment) {
      var body = part.body;
      if(!result.attachments) {
        result.attachments = [];
      }
      result.attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size: body.size,
        attachmentId: body.attachmentId
      });
    }
    firstPartProcessed = true;
  }
  return result;
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
    to: latestEmail.headers.to,
    from: latestEmail.headers.from,
    snippet: latestEmail.snippet,
    subject: latestEmail.headers.subject,
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

export function updateLabelsToShow(labels) {
  return { type: UPDATE_LABELS_TO_SHOW, labels }
}

export function refreshAuth(user, fetch) {
  return GmailActions.refreshToken(user, fetch)
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

export function fullSyncMailBoxLabel(user, labelId) {
  const params = {
    labelIds: labelId,
  }

  const queryString = getQueryString(params);
  return GmailActions.fetchThreadIds(user, "?" + queryString)
    .then(data => {
      let threadIds = [];
      let threads = data.threads || [];
      for (var i = 0; i < threads.length; i++) {
        threadIds.push(threads[i].id)
      }
      return threadIds;
    })
    .then(threadIds => {
      return GmailActions.fetchManyThreads(user, threadIds)
    })
    .then(threads => {
      return processThreads(threads)
    })
}

// just a wrapper for the gmail fetch
export function fetchMultipleLabelInfo(user, labelIds) {
  return GmailActions.fetchMultipleLabelInfo(user, labelIds)
}

// just a wrapper for the gmail fetch
export function fetchLabelInfo(user, labelId) {
  return GmailActions.fetchLabelInfo(user, labelId)
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

function fetchFullEmail(user, email) {
  if (email.attachments) {
    let attachmentIds = email.attachments.map(a => a.attachmentId);
    let singleFetch = GmailActions.fetchManyAttachments(user, email.id, attachmentIds);
    return singleFetch
      .then(data => {
        for (var i = 0; i < email.attachments.length; i++) {
          email.attachments[i].size = data[i].size;
          email.attachments[i].data = data[i].data;
        }
        return email;
      })
  } else {
    return email;
  }
}

function fetchFullEmails(user, emails) {
  let allFetches = [];
  for (var i = 0; i < emails.length; i++) {
    allFetches.push(fetchFullEmail(user, emails[i]))
  }
  return Promise.all(allFetches);
}

// with attachments
function fetchFullThreads(user, threadIds) {
  return GmailActions.fetchManyThreads(user, threadIds)
    .then(data => {
      const threadFetches = [];
      const formattedThreads = [];
      for (var i = 0; i < data.length; i++) {
        let thread = data[i];
        let formattedThread = formatThread(thread);
        formattedThreads.push(formattedThread);
        let singleFetch = fetchFullEmails(user, formattedThread.emails)
          // .then(data => {
          //   formattedThread.emails = data;
          //   formattedThreads.push(formattedThread);
          // })
        threadFetches.push(singleFetch)
      }
      return Promise.all(threadFetches)
        .then(threadEmails => {
          for (var i = 0; i < threadEmails.length; i++) {
            formattedThreads[i].emails = threadEmails[i];
          }
          return formattedThreads;
        })
    })
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
      // .then(threadIds => fetchFullThreads(user, threadIds))
    allFetches.push(threadFetch);
  }
  return Promise.all(allFetches)
    .then(data => {
      const labelsMap = {};
      for (var i = 0; i < data.length; i++) {
        labelsMap[labelIds[i]] = data[i].map(thread => formatThread(thread));
        // labelsMap[labelIds[i]] = data[i];
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

export function addLabelToShow() {
  return ({ type: ADD_LABEL_TO_SHOW })
}

export function requestPartialSyncMailBox() {
  return ({ type: PARTIAL_SYNC_MAILBOX_REQUEST })
}

export function requestChangeLabelToShow(position, oldLabelId, newLabelId) {
  if (oldLabelId !== newLabelId) {
    console.log(position);
    return({ type: CHANGE_LABEL_TO_SHOW, position: position, newLabelId: newLabelId })
  }
}

export function requestRemoveLabelToShow(position) {
  return ({ type: REMOVE_LABEL_TO_SHOW, position: position })
}

export function moveThread(user, threadId, labelToAdd, labelToRemove) {
  const labelsToAdd = [labelToAdd];
  const labelsToRemove = [labelToRemove];
  return GmailActions.changeLabels(user, threadId, labelsToAdd, labelsToRemove)
}

export function editThreadLabels(user, threadId, labelsToAdd, labelsToRemove) {
  return GmailActions.changeLabels(user, threadId, labelsToAdd, labelsToRemove)
}

export function markAsRead(user, threadId) {
  const labelsToAdd = [];
  const labelsToRemove = ['UNREAD'];
  return GmailActions.changeLabels(user, threadId, labelsToAdd, labelsToRemove)
}

export function archiveThread(user, threadId, currentThreadId) {
  const labelsToAdd = [];
  const labelsToRemove = ['INBOX', currentThreadId];
  return GmailActions.changeLabels(user, threadId, labelsToAdd, labelsToRemove)
}

export function trashThread(user, threadId) {
  return GmailActions.trashThread(user, threadId)
}

export function requestMarkAsRead(threadId) {
  return ({ type: MARK_AS_READ_REQUEST, threadId: threadId })
}

export function requestArchiveThread(threadId, currentThreadId) {
  return ({ type: ARCHIVE_THREAD_REQUEST, threadId: threadId, currentThreadId: currentThreadId })
}

export function requestTrashThread(threadId) {
  return ({ type: TRASH_THREAD_REQUEST, threadId: threadId })
}

export function requestCreateLabel(labelName, oldLabelIndex) {
  return ({ type: CREATE_LABEL_REQUEST, labelName, oldLabelIndex })
}

export function createLabel(user, labelName) {
  const reqBody = {
    name: labelName,
    labelListVisibility: 'labelShow',
    messageListVisibility: 'show',
  }
  return GmailActions.createLabel(user, reqBody)
}

export function requestRenameLabel(labelId, newLabelName) {
  return ({ type: RENAME_LABEL_REQUEST, labelId, newLabelName })
}

export function renameLabel(user, labelId, newName) {
  const reqBody = {
    id: labelId,
    name: newName
  }
  return GmailActions.modifyLabel(user, labelId, reqBody)
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
        // .then(res => fetchFullEmails(user, res))
        .then(messages => {
          const labelIds = Object.keys(mailbox);
          const { messagesTrashed, messagesChanged, messagesRemovedFromLabels, messagesDeleted } = sortAndProcessMessages(messages, labelIds)
          return { changed: true, latestHistoryId: data.historyId, messagesTrashed, messagesChanged, messagesRemovedFromLabels, messagesDeleted }
        })
    })
}

export function triggerEmailModal(item, labelId) {
  return({ type: OPEN_EMAIL_MODAL, item, labelId })
}
