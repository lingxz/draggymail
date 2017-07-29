import { select, takeEvery, takeLatest, call, put, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  FULL_SYNC_MAILBOX_REQUEST,
  FULL_SYNC_MAILBOX_FAILURE,
  PARTIAL_SYNC_MAILBOX_REQUEST,
  PARTIAL_SYNC_MAILBOX_SUCCESS,
  PARTIAL_SYNC_MAILBOX_FAILURE,
  GET_MAILBOX_LABEL_INFO_SUCCESS,
  SYNC_MAILBOX_LABEL_SUCCESS,
  UPDATE_HISTORY_ID,
  LIST_ALL_LABELS_REQUEST,
  LIST_ALL_LABELS_SUCCESS,
  LIST_ALL_LABELS_FAILURE,
  ADD_LABEL_TO_SHOW,
} from '../constants';
import * as MailBoxActions from '../actions/mailbox';
import { getUser, getLabels, getLabelIds, getMailBox } from './selectors';

function* fetchAllLabels(action) {
  try {
    const user = yield select(getUser);
    const data = yield MailBoxActions.fetchAllLabels(user);
    yield put({ type: LIST_ALL_LABELS_SUCCESS, labels: data.labels })
  } catch (err) {
    yield put({ type: LIST_ALL_LABELS_FAILURE })
  }
}

function* partialSyncMailBox(action) {
  try {
    const user = yield select(getUser);
    const mailbox = yield select(getMailBox);
    const labels = yield select(getLabels);
    const data = yield MailBoxActions.partialSyncMailBox(user, labels, mailbox);
    if (data.requestFullSync) {
      yield put({ type: PARTIAL_SYNC_MAILBOX_FAILURE, error: 'Invalid History ID, full sync needed' })
      yield put({ type: FULL_SYNC_MAILBOX_REQUEST })
    } else {
      yield put({ type: PARTIAL_SYNC_MAILBOX_SUCCESS, ...data });
      yield put({ type: UPDATE_HISTORY_ID, latestHistoryId: data.latestHistoryId })
    }
  } catch (error) {
    console.log(error);
    yield put({ type: FULL_SYNC_MAILBOX_FAILURE, error });
  }
}

function* fullSyncMailBox(action) {
   try {
      // const labelsToShow = yield select(getLabelIds);
      const labelsToShow = ['INBOX', 'Label_203'];
      const user = yield select(getUser);

      // get label info
      const labelsInfo = yield call(MailBoxActions.fetchMultipleLabelInfo, user, labelsToShow)
      for (var i = 0; i < labelsInfo.length; i++) {
        let labelInfo = labelsInfo[i];
        yield put({type: GET_MAILBOX_LABEL_INFO_SUCCESS, labelId: labelInfo.id, payload: labelInfo})
      }

      // get threads in every label
      const { latestHistoryId, labelsMap } = yield call(MailBoxActions.fullSyncMultipleLabels, user, labelsToShow)
      for (var key in labelsMap) {
        yield put({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: key, threads: labelsMap[key]})
      }
      yield put({ type: UPDATE_HISTORY_ID, latestHistoryId})
   } catch (error) {
      console.log(error);
      yield put({type: FULL_SYNC_MAILBOX_FAILURE })
   }
}

export function* watchFullSyncMailBox() {
  yield takeLatest(FULL_SYNC_MAILBOX_REQUEST, fullSyncMailBox)
}

export function* watchPartialSyncMailBox() {
  yield takeLatest(PARTIAL_SYNC_MAILBOX_REQUEST, partialSyncMailBox)
}

export function* watchFetchAllLabels() {
  yield takeLatest(LIST_ALL_LABELS_REQUEST, fetchAllLabels)
}

export function* addLabelToShow() {
  try {
    const labelIds = yield select(getLabelIds);
    const id = labelIds[labelIds.length - 1];
    const position = labelIds.length - 1;
    const opts = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ labelId: id, position: position }) }
    const res = yield call(fetch, '/api/add-label', opts);
    if (!(res.status === 200)) { console.log(res.statusText) }
  } catch (err) {
    console.log(err)
  }
}

export function* watchAddLabelToShow({ fetch }) {
  yield takeEvery(ADD_LABEL_TO_SHOW, addLabelToShow, fetch)
}
