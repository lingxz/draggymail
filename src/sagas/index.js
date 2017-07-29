import { all } from 'redux-saga/effects'
import { watchAuth } from './user';
import {
  watchFullSyncMailBox,
  watchPartialSyncMailBox,
  watchFetchAllLabels,
  watchAddLabelToShow,
  watchChangeLabel,
} from './mailbox';

export default function* rootSaga(context) {
  yield all([
    watchAuth(context),
    watchFullSyncMailBox(),
    watchPartialSyncMailBox(),
    watchFetchAllLabels(),
    watchAddLabelToShow(context),
    watchChangeLabel(),
  ])
}
