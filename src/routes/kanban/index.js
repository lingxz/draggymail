import React from 'react';
import Layout from '../../components/KanbanLayout';
import Board from '../../components/Board';
import Modal from '../../components/Modal';
import LabelSelector from '../../components/LabelSelector';
import * as MailBoxActions from '../../actions/mailbox';
import { FULL_SYNC_MAILBOX_REQUEST, LIST_ALL_LABELS_REQUEST } from '../../constants';

function action({ store, fetch, req }) {
  const user = store.getState().toJS().user
  if (!user || !user.accessToken) {
    return { redirect: '/' }
  }

  if (!store.getState().toJS().labels.latestHistoryId) {
    store.dispatch({ type: FULL_SYNC_MAILBOX_REQUEST })
    store.dispatch({ type: LIST_ALL_LABELS_REQUEST })
  }


  return {
    chunks: ['kanban'],
    title: 'Emails',
    component: <Layout><Board /><Modal /><LabelSelector /></Layout>,
  };
}

export default action;
