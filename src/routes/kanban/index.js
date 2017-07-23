import React from 'react';
import Layout from '../../components/KanbanLayout';
import Board from '../../components/Board';
import * as MailBoxActions from '../../actions/mailbox';

async function action({ store, fetch }) {
  const user = store.getState().toJS().user
  if (!user) {
    return { redirect: '/login' }
  }

  const labels = ['INBOX', 'Label_203'];

  await store.dispatch(MailBoxActions.fullSyncMultipleLabelsAction(user, labels))
  const label = store.getState().toJS().mailbox['INBOX']
  await store.dispatch(MailBoxActions.syncMailBoxLabel(user, label));
  await store.dispatch(MailBoxActions.fetchAllLabelsAction(user));
  return {
    chunks: ['kanban'],
    title: 'Emails',
    component: <Layout><Board /></Layout>,
  };
}

export default action;
