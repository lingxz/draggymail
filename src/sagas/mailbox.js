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
  CHANGE_LABEL_TO_SHOW,
  CHANGE_LABEL_TO_SHOW_DB_SUCCESS,
  CHANGE_LABEL_TO_SHOW_DB_FAILURE,
  CHANGE_LABEL_TO_SHOW_SUCCESS,
  REMOVE_LABEL_TO_SHOW,
  REMOVE_LABEL_TO_SHOW_SUCCESS,
  REMOVE_LABEL_TO_SHOW_FAILURE,
  MOVE_LABEL,
  MOVE_CARD,
  REQUEST_MARK_AS_READ,
  MARK_AS_READ_SUCCESS,
  MARK_AS_READ_FAILURE,
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
      const tempLabels = yield select(getLabelIds);
      const user = yield select(getUser);
      // remove duplicates
      const labelsToShow = tempLabels.filter((elem, index, self) => {
        return index === self.indexOf(elem);
      });

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

export function* removeLabelToShow(action) {
  try {
    const opts = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ position: action.position })
    }
    const res = yield call(fetch, '/api/remove-label', opts);
    if (res.status === 200) {
      yield put({ type: REMOVE_LABEL_TO_SHOW_SUCCESS, position: action.position })
    } else {
      console.log(res.statusText);
      yield put({ type: REMOVE_LABEL_TO_SHOW_FAILURE })
    }
  } catch(err) {
    console.log(err);
    yield put({ type: REMOVE_LABEL_TO_SHOW_FAILURE })
  }
}

export function* changeLabelToShow(action) {
  try {
    const user = yield select(getUser);
    const mailbox = yield select(getMailBox);
    const labelId = action.newLabelId;
    // check if already loaded
    if (Object.keys(mailbox).indexOf(labelId) === -1) {
      // only need to do full label sync if not this label is not loaded in store
      const labelInfo = yield call(MailBoxActions.fetchLabelInfo, user, labelId)
      yield put({ type: GET_MAILBOX_LABEL_INFO_SUCCESS, labelId: labelInfo.id, payload: labelInfo})
      const threads = yield call(MailBoxActions.fullSyncMailBoxLabel, user, labelId);
      yield put({ type: SYNC_MAILBOX_LABEL_SUCCESS, labelId: labelId, threads: threads })
    }
    // trigger partial sync
    yield put({ type: PARTIAL_SYNC_MAILBOX_REQUEST })
    // update database
    const opts = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ position: action.position, newLabelId: action.newLabelId })
    };
    const res = yield call(fetch, '/api/change-label', opts);
    if (res.status === 200) {
      // only update labelsToShow in store when all the data is loaded to prevent flickering
      yield put({ type: CHANGE_LABEL_TO_SHOW_SUCCESS, position: action.position, newLabelId: action.newLabelId })
    } else {
      console.log(res.statusText);
    }
  } catch (err) {
    console.log(err)
  }
}

export function* moveThread(action) {
  try {
    const user = yield select(getUser);
    // partial sync then move thread, so that history Id is kept up to date
    yield put({ type: PARTIAL_SYNC_MAILBOX_REQUEST });
    const data = yield call(MailBoxActions.moveThread, user, action.threadId, action.nextLabelId, action.lastLabelId)
    console.log(data);
  } catch(err) {
    console.log(err);
  }
}

export function* moveLabelToShow(action) {
  try {
    const opts = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ oldPos: action.lastX, newPos: action.nextX })
    };
    yield call(fetch, '/api/move-label', opts);
  } catch(err) {
    console.log(err);
  }
}

export function* markAsRead(action) {
  try {
    const user = yield select(getUser);
    const res = yield call(MailBoxActions.markAsRead, user, action.threadId)
    yield put({ type: MARK_AS_READ_SUCCESS })
    // trigger partial sync
    yield put({ type: PARTIAL_SYNC_MAILBOX_REQUEST })
  } catch(err) {
    console.log(err)
    yield put({ type: MARK_AS_READ_FAILURE })
  }
}

export function* watchAddLabelToShow({ fetch }) {
  yield takeEvery(ADD_LABEL_TO_SHOW, addLabelToShow, fetch)
}

export function* watchChangeLabel() {
  yield takeEvery(CHANGE_LABEL_TO_SHOW, changeLabelToShow)
}

export function* watchRemoveLabel() {
  yield takeLatest(REMOVE_LABEL_TO_SHOW, removeLabelToShow)
}

export function* watchMoveLabel() {
  yield takeLatest(MOVE_LABEL, moveLabelToShow)
}

export function* watchMoveThread() {
  yield takeEvery(MOVE_CARD, moveThread)
}

export function* watchMarkAsRead() {
  yield takeEvery(REQUEST_MARK_AS_READ, markAsRead)
}
