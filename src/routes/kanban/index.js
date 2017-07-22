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

  await store.dispatch(MailBoxActions.fullSyncAllLabels(user, labels))
  return {
    chunks: ['kanban'],
    title: 'Emails',
    component: <Layout><Board /></Layout>,
  };
}

export default action;
