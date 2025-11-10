// API Data Types for King's Lab

export interface HeroData {
  id: number;
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
  id: number;
  title: string;
  description: string;
  details: string;
  icon: string;
  image: string;
  order: number;
  status?: 'draft' | 'published';
}

export interface TeamMember {
  id: number;
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
  id: number;
  title: string;
  authors: string;
  author_ids?: number[]; // IDs of team members who are authors
  journal?: string;
  conference?: string;
  book_chapter?: string;
  publication_type: string; // "Journal", "Conference", "Book Chapter", etc.
  year: number;
  citations: number;
  tag: string;
  category: string;
  abstract?: string;
  url?: string;
  certificate_url?: string;
  event_photo?: string;
  doi?: string;
  pages?: string;
  volume?: string;
  issue?: string;
  publisher?: string;
  status?: 'draft' | 'published';
}

export interface ContactInfo {
  id: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

export interface SiteSettings {
  id: number;
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
  id: number;
  year: number;
  title: string;
  description: string;
  image?: string;
  category: string; // "milestone", "achievement", "publication", "award", etc.
  order: number;
  status?: 'draft' | 'published';
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
