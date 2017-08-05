import { OPEN_LABEL_SELECTOR, CLOSE_LABEL_SELECTOR, TOGGLE_LABEL_SELECTOR, EDIT_LABELS_REQUEST } from '../constants';

export function openLabelSelector(threadId, thread, x, y, selectedLabels) {
  return { type: OPEN_LABEL_SELECTOR, threadId, thread, x, y, selectedLabels, currentBoard }
}

export function closeLabelSelector() {
  return { type: CLOSE_LABEL_SELECTOR }
}

export function toggleLabelSelector(threadId, thread, x, y, selectedLabels, currentBoard) {
  return { type: TOGGLE_LABEL_SELECTOR, threadId, thread, x, y, selectedLabels, currentBoard }
}

export function requestEditLabels(threadId, thread, labelsToAdd, labelsToRemove, newLabelsList, currentBoard) {
  return { type: EDIT_LABELS_REQUEST, threadId, thread, labelsToAdd, labelsToRemove, newLabelsList, currentBoard }
}
