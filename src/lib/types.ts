// API Data Types for King's Lab

export interface HeroData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  background_image: string;
  stats: {
    projects: string;
    members: string;
    publications: string;
  };
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: string;
  image: string;
  order: number;
  status?: 'draft' | 'published';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  education: string;
  affiliation?: string;
  publications_count: number;
  email: string;
  image: string;
  expertise: string[] | null; // Can be null from backend
  linkedin_url?: string;
  researchgate_url?: string;
  github_url?: string;
  google_scholar_url?: string;
  cv_url?: string; // CV/Resume file URL
  order: number;
  is_alumni: boolean;
  alumni_info?: string; // Why they left (scholarship, new position, etc.)
  alumni_year?: number; // Year they became alumni
  current_position?: string; // Where they are now
  status?: 'draft' | 'published';
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  author_ids?: string[]; // Mongo ObjectIds of team members who are authors
  venue: string; // Conference/Journal/Book Chapter name based on publication_type
  publication_type: string; // "journal", "conference", "book_chapter", etc.
  year: number;
  citations: number;
  tag: string;
  category: string;
  categories?: string[]; // New multi-category support
  abstract?: string;
  url?: string;
  certificate_url?: string;
  event_photo?: string;
  doi?: string;
  pages?: string;
  volume?: string;
  issue?: string;
  publisher?: string;
  status?: 'draft' | 'on_review' | 'accepted' | 'presented' | 'published';
  show_in_journey?: boolean;
  [key: string]: string | number | string[] | undefined | boolean; // Allow dynamic access to all property types
}

export interface ContactInfo {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

export interface SiteSettings {
  id: string;
  lab_name: string;
  tagline: string;
  about: string;
  logo_text: string;
  social_links: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image?: string;
  category: string; // "milestone", "achievement", "publication", "award", etc.
  order: number;
  status?: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
