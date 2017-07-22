import * as GmailActions from './gmail';
import {
  SYNC_MAILBOX_LABEL_START,
  SYNC_MAILBOX_LABEL_SUCCESS,
  SYNC_MAILBOX_LABEL_FAILURE,
  GET_MAILBOX_LABEL_INFO_START,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  GET_MAILBOX_LABEL_INFO_FAILURE,
} from '../constants';


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

export function fullSyncMailBoxLabel(user, label) {
  const params = {
    labelIds: label.id
  }

  const queryString = getQueryString(params);
  return GmailActions.fetchMessageIds(user, "?" + queryString)
    .then(data => {
      let messageIds = [];
      for (var i = 0; i < data.messages.length; i++) {
        messageIds.push(data.messages[i].id)
      }
      return messageIds;
    })
    .then(messageIds => GmailActions.fetchManyMessages(user, messageIds))
    .then(emails => processEmails(emails))
}

export function fullSyncMailBoxLabelAction(user, label) {
  return dispatch => {
    dispatch({ type: SYNC_MAILBOX_LABEL_START, label })
    try {
      return fullSyncMailBoxLabel(user, label)
        .then(emails => dispatch({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: label.id, emails }))
    }
    catch(err) {
      return dispatch({ type: SYNC_MAILBOX_LABEL_FAILURE, labelId: label.id, err })
    }
  }
}

// export function fullSyncMultipleLabels(user, labelIds) {
//   const params = {
//     labelIds: labelIds,
//   };

//   const queryString = getQueryString(params);
//   return GmailActions.fetchMessageIds(user, "?" + queryString)
//     .then(data => {
//       let messageIds = [];
//       for (var i = 0; i < data.messages.length; i++) {
//         messageIds.push(data.messages[i].id)
//       }
//       return messageIds;
//     })
//     .then(messageIds => GmailActions.fetchManyMessages(user, messageIds))
//     .then(emails => sortEmails(emails, labelIds))
// }

export function fullSyncMultipleLabels(user, labelIds) {
  let allFetches = [];
  for (var i = 0; i < labelIds.length; i++) {
    let param = {
      labelIds: labelIds[i],
    };
    let queryString = getQueryString(param);
    let messageFetch = GmailActions.fetchMessageIds(user, "?" + queryString)
      .then(data => {
        if (data.messages === undefined) { return []; }
        let messageIds = [];
        for (var i = 0; i < data.messages.length; i++) {
          messageIds.push(data.messages[i].id)
        }
        return messageIds;
      })
      .then(messageIds => GmailActions.fetchManyMessages(user, messageIds))
    allFetches.push(messageFetch);
  }
  return Promise.all(allFetches)
    .then(data => {
      const labelsMap = {};
      for (var i = 0; i < data.length; i++) {
        labelsMap[labelIds[i]] = data[i].map(email => formatEmail(email));
      }
      return labelsMap;
    })
}

export function fullSyncAllLabels(user, labelIds) {
  return dispatch => {
    for (var idx = 0; idx < labelIds.length; idx++) {
      dispatch({ type: GET_MAILBOX_LABEL_INFO_START, labelId: labelIds[idx] })
    }
    try {
      return GmailActions.fetchMultipleLabelInfo(user, labelIds)
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            let labelInfo = data[i];
            dispatch({ type: GET_MAILBOX_LABEL_INFO_SUCCESS, labelId: labelInfo.id, payload: labelInfo })
          }
          for (var idx = 0; idx < labelIds.length; idx++) {
            dispatch({ type: SYNC_MAILBOX_LABEL_START, labelId: labelIds[idx] })
          }
          return fullSyncMultipleLabels(user, labelIds);
        })
        .then(data => {
          for (var key in data) {
            dispatch({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: key, emails: data[key] })
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
