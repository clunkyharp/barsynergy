'use server';

import {
  deleteApplication as deleteApplicationHandler,
  updateApplicationProcessing as updateApplicationProcessingHandler,
  updateApplicationStatus as updateApplicationStatusHandler
} from './status-actions';
import {
  updateApplicationBusinessNotes as updateApplicationBusinessNotesHandler,
  updateApplicationInternalNotes as updateApplicationInternalNotesHandler
} from './notes-actions';
import {
  createVacancyDraftFromApplication as createVacancyDraftFromApplicationHandler,
  publishContentFromApplication as publishContentFromApplicationHandler
} from './publication-actions';
import {
  prepareBusinessAccessAction as prepareBusinessAccessActionHandler
} from './business-access-actions';

export async function updateApplicationProcessing(formData: FormData) {
  return updateApplicationProcessingHandler(formData);
}

export async function updateApplicationStatus(formData: FormData) {
  return updateApplicationStatusHandler(formData);
}

export async function updateApplicationBusinessNotes(formData: FormData) {
  return updateApplicationBusinessNotesHandler(formData);
}

export async function updateApplicationInternalNotes(formData: FormData) {
  return updateApplicationInternalNotesHandler(formData);
}

export async function createVacancyDraftFromApplication(formData: FormData) {
  return createVacancyDraftFromApplicationHandler(formData);
}

export async function publishContentFromApplication(formData: FormData) {
  return publishContentFromApplicationHandler(formData);
}

export async function prepareBusinessAccessAction(formData: FormData) {
  return prepareBusinessAccessActionHandler(formData);
}

export async function deleteApplication(formData: FormData) {
  return deleteApplicationHandler(formData);
}
