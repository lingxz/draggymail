import fetch from 'isomorphic-fetch';


/* **************************************************************************/
// Label
/* **************************************************************************/


export function fetchLabelInfo(user, labelId) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/labels/";
  return fetch(url + labelId, {
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchMultipleLabelInfo(user, labelIds) {
  let allFetches = [];
  for (var i = 0; i < labelIds.length; i++) {
    let labelId = labelIds[i];
    let promise = fetchLabelInfo(user, labelId)
      .then(data => {
        const queryString = 'labelIds=UNREAD&labelIds=' + labelId
        return fetchThreadIds(user, '?' + queryString)
          .then(threadData => {
            let threads = threadData.threads || [];
            if (threads.length === 0) {
              data.latestUnreadThreads = [];
              return data
            }
            data.latestUnreadThreads = threadData.threads;
            return data;
          })
      })
    allFetches.push(promise);
  }
  return Promise.all(allFetches)
}

/* **************************************************************************/
// Fetch Emails and messages
/* **************************************************************************/

export function fetchMessageIds(user, query) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/messages";
  return fetch(url + query, {
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchThreadIds(user, query) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/threads";
  return fetch(url + query, {
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchThread(user, threadId) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/threads/";
  return fetch(url + threadId, {
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchMessage(user, messageId) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/messages/";
  return fetch(url + messageId, {
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchManyThreads(user, threadIds) {
  let allFetches = [];
  for (var i = 0; i < threadIds.length; i++) {
    let threadId = threadIds[i];
    allFetches.push(fetchThread(user, threadId));
  }
  return Promise.all(allFetches)
}

export function fetchManyMessages(user, messageIds) {
  let allFetches = [];
  for (var i = 0; i < messageIds.length; i++) {
    let messageId = messageIds[i];
    allFetches.push(fetchMessage(user, messageId));
  }
  return Promise.all(allFetches)
}
