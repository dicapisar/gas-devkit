export interface AdvancedService {
  id: string;
  name: string;
  serviceId: string;
  version: string;
  userSymbol: string;
  description: string;
  sampleCode: string;
  requiresCloudProject: boolean;
}

const service = (id: string, name: string, serviceId: string, version: string, userSymbol: string, description: string): AdvancedService => ({
  id, name, serviceId, version, userSymbol, description,
  requiresCloudProject: true,
  sampleCode: `export class ${userSymbol}Service {\n  list(): unknown {\n    return ${userSymbol};\n  }\n}`,
});

export const SERVICE_CATALOG: AdvancedService[] = [
  service('sheets', 'Google Sheets API', 'sheets', 'v4', 'Sheets', 'Batch cell operations, formatting, and complex formulas.'),
  service('drive', 'Google Drive API', 'drive', 'v3', 'Drive', 'Advanced search, permissions, and file metadata.'),
  service('gmail', 'Gmail API', 'gmail', 'v1', 'Gmail', 'Drafts, labels, filters, and email threads.'),
  service('calendar', 'Google Calendar API', 'calendar', 'v3', 'Calendar', 'Shared calendars, recurring events, and conferences.'),
  service('docs', 'Google Docs API', 'docs', 'v1', 'Docs', 'Paragraphs, tables, and text replacements.'),
  service('slides', 'Google Slides API', 'slides', 'v1', 'Slides', 'Presentation generation and slide manipulation.'),
  service('forms', 'Google Forms API', 'forms', 'v1', 'Forms', 'Form responses and structured form editing.'),
  service('tasks', 'Google Tasks API', 'tasks', 'v1', 'Tasks', 'Task lists, subtasks, and due dates.'),
  service('people', 'Google People API', 'people', 'v1', 'People', 'Contacts and user profile data.'),
  service('classroom', 'Google Classroom API', 'classroom', 'v1', 'Classroom', 'Courses, assignments, announcements, and grades.'),
  service('bigquery', 'Google BigQuery API', 'bigquery', 'v2', 'BigQuery', 'Analytical queries and bulk data exports.'),
  service('chat', 'Google Chat API', 'chat', 'v1', 'Chat', 'Chat bots, interactive cards, and webhooks.'),
  service('admin', 'Admin Directory API', 'admin', 'directory_v1', 'AdminDirectory', 'Users, groups, organizational units, and domains.'),
  service('reports', 'Admin Reports API', 'reports', 'reports_v1', 'AdminReports', 'Access and activity auditing.'),
  service('licensing', 'Admin Licensing API', 'licensing', 'licensing_v1', 'AdminLicenseManager', 'License assignment and revocation.'),
  service('driveactivity', 'Drive Activity API', 'driveactivity', 'v2', 'DriveActivity', 'Historical file and folder events.'),
  service('youtube', 'YouTube Data API', 'youtube', 'v3', 'YouTube', 'Videos, playlists, and channels.'),
  service('youtubeAnalytics', 'YouTube Analytics API', 'youtubeAnalytics', 'v2', 'YouTubeAnalytics', 'Playback and engagement metrics.'),
  service('analyticsdata', 'Google Analytics Data API', 'analyticsdata', 'v1beta', 'AnalyticsData', 'GA4 reports and events.'),
  service('tagmanager', 'Tag Manager API', 'tagmanager', 'v2', 'TagManager', 'Containers, triggers, tags, and versions.'),
  service('cloudidentity', 'Cloud Identity API', 'cloudidentity', 'v1', 'CloudIdentity', 'Dynamic groups and secure identities.')
];
