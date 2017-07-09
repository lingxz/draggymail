import React from 'react';
import Layout from '../../components/KanbanLayout';
import Board from '../../components/Board';
import * as ListsActions from '../../actions/lists';

function action() {
  return {
    chunks: ['kanban'],
    component: <Layout><Board /></Layout>,
  };
}

export default action;
