import { all } from 'redux-saga/effects'
import { watchAuth } from './user';
import {
  watchFullSyncMailBox,
  watchPartialSyncMailBox,
  watchFetchAllLabels,
  watchAddLabelToShow,
  watchChangeLabel,
  watchRemoveLabel,
  watchMoveLabel,
  watchMoveThread,
  watchMarkAsRead,
  watchArchiveThread,
  watchTrashThread,
  watchCreateLabel,
  watchRenameLabel,
  watchEditLabels,
} from './mailbox';

export default function* rootSaga(context) {
  yield all([
    watchAuth(context),
    watchFullSyncMailBox(),
    watchPartialSyncMailBox(),
    watchFetchAllLabels(),
    watchAddLabelToShow(context),
    watchChangeLabel(),
    watchRemoveLabel(),
    watchMoveLabel(),
    watchMoveThread(),
    watchMarkAsRead(),
    watchArchiveThread(),
    watchTrashThread(),
    watchCreateLabel(),
    watchRenameLabel(),
    watchEditLabels(),
  ])
}
