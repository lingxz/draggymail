import { select, race, take, takeEvery, takeLatest, call, put, all } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { getUser, getLabelIds } from './selectors';
import * as MailBoxActions from '../actions/mailbox';
import {
  FULL_SYNC_MAILBOX_REQUEST,
  FULL_SYNC_MAILBOX_FAILURE,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  SYNC_MAILBOX_LABEL_SUCCESS,
  USER_LOGIN,
  USER_LOGOUT,
  UPDATE_USER_CREDENTIALS,
  USER_LOGIN_FAILURE,
} from '../constants';


export function* watchAuth({ fetch }) {
  while (true) {
    try {
      let user = yield select(getUser);
      if (!user || !user.accessToken){
        yield take(USER_LOGIN);
      }
      user = yield select(getUser);
      const { expired } = yield race({
        logout: take(USER_LOGOUT),
        expired: call(delay, user.expiryTime - (new Date().getTime() - 60 * 1000)),
      })
      if (!expired) {
        call(fetch, '/logout', { method: 'POST', redirect: 'follow', credentials: 'same-origin' })
      } else {
        let newUser = yield call(MailBoxActions.refreshAuth, user, fetch);
        yield put({ type: UPDATE_USER_CREDENTIALS, user: newUser })
      }
    } catch (error) {
      console.log(error);
      yield put({ type: USER_LOGIN_FAILURE });
    }
  }
}
