/**
 * Barrel export for the server email module.
 */
export { sendEmail, type EmailParams } from './client';
export {
	firstReminderTemplate,
	secondReminderTemplate,
	finalNoticeTemplate,
	reminderTemplate,
	type ReminderLanguage,
	type ReminderTemplateName,
	type ReminderTemplateInput,
	type ReminderTemplateOutput
} from './templates';
