import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import fetch from 'isomorphic-fetch';
import EmailType from '../types/EmailType';

function getFieldFromPayload(headers, field) {
  for (var i = 0; i < headers.length; i++) {
    var dict = headers[i];
    if (dict.name == field) {
      return dict.value
    }
  }
  return null;
}

function processEmails(emails) {
  let inbox = [];
  for (var idx = 0; idx < emails.length; idx++) {
    var email = emails[idx];
    inbox.push({
      id: email.id,
      subject: getFieldFromPayload(email.payload.headers, 'Subject'),
      from: getFieldFromPayload(email.payload.headers, 'From'),
      to: getFieldFromPayload(email.payload.headers, 'To'),
      content: email.snippet,
      threadId: email.threadId,
      labelIds: email.labelIds,
    })
  };
  return inbox;
}

const emails = {
  type: new List(EmailType),
  resolve(root) {
    const url = 'https://www.googleapis.com/gmail/v1/users/me/messages';
    const accessToken = root.request.user.accessToken;
    return fetch(url, {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + accessToken,
      },
    }).then(response => response.json())
      .then(data => {
        const messages = data.messages;
        const emailFetchUrl = "https://www.googleapis.com/gmail/v1/users/me/messages/";
        var emailFetches = [];
        for (var i = 0; i <10; i++) {
          var email = messages[i];
          var emailFetch = fetch(emailFetchUrl + email.id, {
            methods: 'GET',
            headers: {
              "Authorization": "Bearer " + accessToken,
            },
          });
          emailFetches.push(emailFetch);
        }
        return Promise.all(emailFetches)
          .then(responses => {
            return Promise.all(responses.map(r => r.json()))
              .then(emails => processEmails(emails))
          })
      })
  }
};

export default emails;
