import React from 'react';
import Layout from '../../components/KanbanLayout';
import Board from '../../components/Board';
import * as MailBoxActions from '../../actions/mailbox';
import { FULL_SYNC_MAILBOX_REQUEST, LIST_ALL_LABELS_REQUEST } from '../../constants';

function action({ store, fetch, req }) {
  const user = store.getState().toJS().user
  if (!user) {
    return { redirect: '/login' }
  }

  // if (!store.getState().toJS().labels.labelsToShow) {
  //   const labelsToShow =
  // } else {
  //   const labelsToShow = store.getState().toJS().labels.labelsToShow;
  // }
  console.log("user's labels======")
  console.log(user.labels);
  if (!store.getState().toJS().labels.latestHistoryId) {
    store.dispatch({ type: FULL_SYNC_MAILBOX_REQUEST })
    store.dispatch({ type: LIST_ALL_LABELS_REQUEST })
  }


  return {
    chunks: ['kanban'],
    title: 'Emails',
    component: <Layout><Board /></Layout>,
  };
}

export default action;
