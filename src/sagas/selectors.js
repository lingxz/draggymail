import { select } from 'redux-saga/effects';

export const getLabels = state => state.toJS().labels;
export const getLabelIds = state => state.toJS().labels.labelsToShow;
export const getUser = state => state.toJS().user;
export const getMailBox = state => state.toJS().mailbox;
