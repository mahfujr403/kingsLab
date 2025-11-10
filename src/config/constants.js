module.exports = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // File Upload
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // User Roles
  ROLES: {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },

  // Publication Types
  PUBLICATION_TYPES: [
    'journal',
    'conference',
    'workshop',
    'book',
    'book_chapter',
    'preprint',
    'thesis',
    'technical_report'
  ],

  // Team Member Roles
  TEAM_ROLES: [
    'professor',
    'associate_professor',
    'assistant_professor',
    'postdoc',
    'researcher',
    'phd_student',
    'masters_student',
    'undergraduate',
    'research_assistant',
    'visiting_researcher'
  ],

  // Sort Orders
  SORT_ORDERS: {
    ASC: 'asc',
    DESC: 'desc'
  }
};