/**
 * Messages — the user-facing strings the contact path shows.
 *
 * `serverMessages` are returned by api/contact.ts and rendered verbatim by the
 * browser (ContactSection throws `result.error` and displays it), so they are
 * product copy that happens to travel across the network seam. They were
 * previously authored inline in the serverless function.
 *
 * `clientMessages` never leave the browser but belong to the same path, so they
 * live beside their server counterparts rather than inside a component.
 *
 * Framework-free — imported by both the Vite bundle and the Vercel function.
 */

import { identity } from './identity';
import type { InquiryProblem } from '../contact/inquiry';

export const serverMessages = {
  notConfigured: 'The contact form is not configured. Please email us directly.',
  malformed: 'Malformed request.',
  rateLimited: 'Too many submissions from this connection. Try again shortly.',
  missingHumanCheck: 'Please complete the human check and try again.',
  humanCheckFailed: 'Human check failed. Please try the check again.',
  missingName: 'Please add your name.',
  invalidEmail: "That email address doesn't look right.",
  missingMessage: "Please tell us what you're working on.",
  saveFailed: `We could not save your message. Please email ${identity.email}.`,
} as const;

export const clientMessages = {
  humanCheckIncomplete: 'Please complete the human check below.',
  humanCheckUnavailable: `The human check could not load. Check your connection, or email ${identity.email}.`,
  submitFailed: 'Transmission failed — try again.',
} as const;

/**
 * What each Inquiry rule says when it fails. Both sides read this map — the
 * browser to explain a bad field before it POSTs, the function to answer with
 * the same words after it re-checks.
 */
export const inquiryProblemMessages: Record<InquiryProblem, string> = {
  'missing-name': serverMessages.missingName,
  'invalid-email': serverMessages.invalidEmail,
  'missing-message': serverMessages.missingMessage,
};

export type ServerMessages = typeof serverMessages;
export type ClientMessages = typeof clientMessages;
