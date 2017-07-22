// import google from 'googleapis';
import config from '../../config.js';

// const GOOGLE_CLIENT_ID = config.auth.google.id;
// const GOOGLE_CLIENT_SECRET = config.auth.google.secret;

// const gPlus = google.plus('v1')
// const gmail = google.gmail('v1')

/**
* Generates the auth token object to use with Google
* @param accessToken: the access token from the mailbox
* @param refreshToken: the refresh token from the mailbox
* @param expiryTime: the expiry time from the mailbox
* @return the google auth object
*/
function generateAuth(accessToken, refreshToken, expiryTime) {
  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryTime,
  })
  return auth;
}

/**
* Rejects a call because the mailbox has no authentication info
* @param info: any information we have
* @return promise - rejected
*/
function rejectWithNoAuth(info) {
  return Promise.reject({
    info: info,
    err: 'Local - Mailbox missing authentication information'
  })
}

/**
* Syncs a profile for a mailbox
* @param auth: the auth to access google with
* @return promise
*/
export function fetchMailboxProfile(auth) {
  if (!auth) { return this.rejectWithNoAuth() }

  return new Promise((resolve, reject) => {
    gPlus.people.get({
      userId: 'me',
      auth: auth
    }, (err, response) => {
      if (err) {
        reject({ err: err })
      } else {
        resolve({ response: response })
      }
    })
  })
}

/* **************************************************************************/
// Label
/* **************************************************************************/

/**
* Syncs the label for a mailbox. The label is a cheap call which can be used
* to decide if the mailbox has changed
* @param auth: the auth to access google with
* @param labelId: the id of the label to sync
* @return promise
*/
import fetch from 'isomorphic-fetch';

export function fetchMailboxLabel(auth, labelId) {
  if (!auth) { return rejectWithNoAuth() }

  return new Promise((resolve, reject) => {
    gmail.users.labels.get({
      userId: 'me',
      id: labelId,
      auth: auth
    }, (err, response) => {
      if (err) {
        reject({ err: err })
      } else {
        resolve({ response: response })
      }
    })
  })
}

/* **************************************************************************/
// Fetch Emails and messages
/* **************************************************************************/

/**
* Fetches the unread summaries for a mailbox
* @param auth: the auth to access google with
* @param query: the query to ask the server for
* @param limit=10: the limit on results to fetch
* @return promise
*/
export function fetchThreadIds(auth, query, limit = 25) {
  if (!auth) { return this.rejectWithNoAuth() }

  return

  return new Promise((resolve, reject) => {
    gmail.users.threads.list({
      userId: 'me',
      q: query,
      maxResults: limit,
      auth: auth
    }, (err, response) => {
      if (err) {
        reject({ err: err })
      } else {
        resolve({ response: response })
      }
    })
  })
}

/**
* Fetches an email from a given id
* @param auth: the auth to access google with
* @param threadId: the id of the thread
* @return promise
*/
export function fetchThread(auth, threadId) {
  if (!auth) { return this.rejectWithNoAuth() }

  return new Promise((resolve, reject) => {
    gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      auth: auth
    }, (err, response) => {
      if (err) {
        reject({ err: err })
      } else {
        resolve({ response: response })
      }
    })
  })
}
