export function refreshToken(user) {
  return fetch('/api/google/refreshtoken', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: user.refreshToken,
      accessToken: user.accessToken,
    })
  })
  .then(response => response.json())
}

/* **************************************************************************/
// Label
/* **************************************************************************/


export function fetchLabelInfo(user, labelId) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/labels/";
  return fetch(url + labelId, {
    method: 'GET',
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchAllLabels(user) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/labels";
  return fetch(url, {
    method: 'GET',
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

export function fetchHistory(user, startHistoryId, query = null) {
  let url = 'https://www.googleapis.com/gmail/v1/users/me/history' + '?startHistoryId=' + startHistoryId;
  return fetch(url, {
    method: 'GET',
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

/* **************************************************************************/
// Fetch Emails and messages
/* **************************************************************************/

export function fetchMessageIds(user, query) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/messages";
  return fetch(url + query, {
    method: 'GET',
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchThreadIds(user, query) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/threads";
  return fetch(url + query, {
    method: 'GET',
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => response.json())
}

export function fetchThread(user, threadId) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/threads/";
  return fetch(url + threadId, {
    method: 'GET',
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => {
      if (response.status === 404) {
        // thread has been deleted or doesn't exist
        return { id: threadId, deleted: true, }
      } else {
        return response.json()
      }
    })

}

export function fetchMessage(user, messageId) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/messages/";
  return fetch(url + messageId, {
    method: 'GET',
    headers: { "Authorization": "Bearer " + user.accessToken },
  })
    .then(response => {
      if (response.status === 404) {
        // message has been deleted or doesn't exist
        return { id: messageId, deleted: true, }
      } else {
        return response.json()
      }
    })
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

