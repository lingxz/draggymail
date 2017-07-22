import faker from 'faker';
import fetch from 'isomorphic-fetch';

export const GET_LISTS_START = 'GET_LISTS_START';
export const GET_LISTS = 'GET_LISTS';
export const MOVE_CARD = 'MOVE_CARD';
export const MOVE_LIST = 'MOVE_LIST';
export const TOGGLE_DRAGGING = 'TOGGLE_DRAGGING';

export function getEmails(user) {
  return dispatch => {
    dispatch({ type: GET_LISTS_START, quantity: user.id });
    const url = 'https://www.googleapis.com/gmail/v1/users/me/messages'
    return fetch(url, {
      method: 'GET',
      headers: {
        "Authorization": "Bearer " + user.accessToken,
      },
    }).then((response) => {
        return response.json();
      }, (err) => dispatch({ type: GET_LISTS, lists: [], payload: { err, error: true }})
    ).then((data) => {
      const messages = data.messages;
      const emailFetchUrl = "https://www.googleapis.com/gmail/v1/users/me/messages/"
      var emailFetches = [];
      for (var i = 0; i < 10; i++) {
        var email = messages[i];
        var emailFetch = fetch(emailFetchUrl + email.id, {
          method: 'GET',
          headers: {
            "Authorization": "Bearer " + user.accessToken,
          }
        })
        emailFetches.push(emailFetch);
      }
      return Promise.all(emailFetches)
        .then((values) => {
          var response = [];
          for (var i = 0; i < values.length; i++) {
            response.push(values[i].json())
          }
          return response;
        }, (err) => dispatch({ type: GET_LISTS, lists: [], payload: { err, error: true }}))
        .then((promises) => {
          return Promise.all(promises)
            .then((emails) => {
              var inbox = [];
              for (var idx = 0; idx < emails.length; idx++){
                var email = emails[idx];
                inbox.push({
                  id: email.id,
                  title: email.payload.headers[1].name,
                  firstName: 'Amy',
                  lastName: 'Whites',
                  content: email.snippet,
                })
              };
              var emailBoards = [];
              emailBoards.push({
                id: 'inboxId',
                name: 'Inbox',
                cards: inbox,
              })
              dispatch({ type: GET_LISTS, lists: emailBoards, payload: { message: "success" }})
            })
        })
    })
  }
}


// export function getLists(quantity) {
//   return dispatch => {
//     dispatch({ type: GET_LISTS_START, quantity });
//     setTimeout(() => {
//       const lists = [];
//       let count = 0;
//       for (let i = 0; i < quantity; i++) {
//         const cards = [];
//         const randomQuantity = 2;
//         // const randomQuantity = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
//         for (let ic = 0; ic < randomQuantity; ic++) {
//           cards.push({
//             id: count,
//             firstName: faker.name.firstName(),
//             lastName: faker.name.lastName(),
//             title: faker.name.jobTitle()
//           });
//           count = count + 1;
//         }
//         lists.push({
//           id: i,
//           name: faker.commerce.productName(),
//           cards
//         });
//       }
//       dispatch({ type: GET_LISTS, lists, isFetching: true });
//     }, 1000); // fake delay
//     dispatch({ type: GET_LISTS_START, isFetching: false });
//   };
// }

export function moveList(lastX, nextX) {
  return (dispatch) => {
    dispatch({ type: MOVE_LIST, lastX, nextX });
  };
}

export function moveCard(lastX, lastY, nextX, nextY) {
  return (dispatch) => {
    dispatch({ type: MOVE_CARD, lastX, lastY, nextX, nextY });
  };
}

export function toggleDragging(isDragging) {
  return (dispatch) => {
    dispatch({ type: TOGGLE_DRAGGING, isDragging });
  };
}
