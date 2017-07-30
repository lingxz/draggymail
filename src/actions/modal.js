import {
  OPEN_EMAIL_MODAL,
  CLOSE_EMAIL_MODAL,
} from '../constants';

export function triggerEmailModal(item) {
  return({ type: OPEN_EMAIL_MODAL, item })
}

export function closeEmailModal() {
  return({ type: CLOSE_EMAIL_MODAL })
}
