export const USER_LOGOUT = 'USER_LOGOUT'; // action type
export const USER_LOGIN = 'USER_LOGIN';

export function logout() { // redux action
  return (dispatch) => {
    dispatch({ type: USER_LOGOUT });
    return fetch('/logout', { method: 'POST', redirect: 'follow', credentials: 'same-origin' })
      .then(() => dispatch({ type: USER_LOGOUT, error: false }))
      .catch(error => dispatch({ type: USER_LOGOUT, payload: error, error: true }))
  }
}

export function login(user) {
  return ({ type: USER_LOGIN, user })
}
