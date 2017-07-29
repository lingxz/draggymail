import { USER_LOGIN, USER_LOGOUT } from '../constants';

export function logout() {
  return { type: USER_LOGOUT }
}
export function login(user) {
  return { type: USER_LOGIN, user }
}
