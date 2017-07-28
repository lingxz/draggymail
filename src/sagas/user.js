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

// not sure if passing fetch all the way down is the correct way to do it...but it works
function* refreshAuth(user, fetch) {
  while (true) {
    yield call(delay, 10*1000);
    yield call(delay, user.expiryTime - (new Date()).getTime() - 10 * 1000)
    let newUser = yield call(MailBoxActions.refreshAuth, user, fetch)
    yield put({ type: UPDATE_USER_CREDENTIALS, user: newUser })
  }
}

export function* watchAuth({ fetch }) {
  while (true) {
    try {
      yield take(USER_LOGIN);
      const user = yield select(getUser);
      yield race({
        logout: take(USER_LOGOUT),
        refreshToken: call(refreshAuth, user, fetch)
      })
      if (logout) {
        call(fetch, '/logout', { method: 'POST', redirect: 'follow', credentials: 'same-origin' })
      }
    } catch (error) {
      console.log(error);
      yield put({ type: USER_LOGIN_FAILURE });
    }
  }
}
