import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as Int,
} from 'graphql';
import EmailType from './EmailType';


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

// fetch a list of messages given their ID
// function fetchEmails(messages) {
//   for i in range
// }

function getEmailsFromLabelId(root) {
  const url = "https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=";
  const id = root.id;
  const accessToken = root.request.user.accessToken;
  return fetch(url + id, {
    methods: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    }
  }).then(response => response.json())
    .then(data => processEmails(data.messages))
}

function processLabelsData(data) {
  return {
    id: data.id,
    name: data.id,
    messagesTotal: data.messagesTotal,
    messagesUnread: data.messagesUnread,
    threadsTotal: data.threadsTotal,
    labelType: data.type
  }
}

const LabelType = new ObjectType({
  name: 'Label',
  fields: {
    id: { type: new NonNull(StringType) },
    name: { type: new NonNull(StringType) },
    messagesTotal: { type: new NonNull(Int) },
    messagesUnread: { type: Int },
    threadsTotal: { type: Int },
    threadsUnread: { type: Int },
    labelType: { type: StringType },
    emails: {
      type: StringType,
      resolve: (root) => getEmailsFromLabelId(root),
    }
  },
});

export default LabelType;
