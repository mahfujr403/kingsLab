import type {
  HeroData,
  ResearchArea,
  TeamMember,
  Publication,
  ContactInfo,
  SiteSettings,
  TimelineEvent,
  ApiResponse,
  ApiError
} from "./types";
import { config } from "./config";

// API Base URL is configured in /lib/config.ts
const API_BASE_URL = config.apiBaseUrl;

class ApiClient {
  private baseUrl: string;
  private requestCache: Map<string, { promise: Promise<any>; timestamp: number }> = new Map();
  private readonly DEDUP_WINDOW = 1000; // 1 second deduplication window

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Request deduplication: prevent multiple identical requests within 1 second
    const cacheKey = `${options?.method || 'GET'}-${endpoint}`;
    const cached = this.requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.DEDUP_WINDOW) {
      console.log(`🔄 Deduplicating request to ${endpoint}`);
      return cached.promise;
    }

    const requestPromise = (async () => {
      try {
        const url = `${this.baseUrl}${endpoint}`;
        
        console.log(`📡 Fetching from ${endpoint}...`);
        
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options?.headers,
          },
          ...options,
        });

        console.log(`📡 Response from ${endpoint}: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          // Handle rate limiting specifically
          if (response.status === 429) {
            console.warn(`⚠️ Rate limited on ${endpoint}. Please wait before retrying.`);
            const error: ApiError = {
              message: "Too many requests. Please wait a moment and try again."
            };
            throw new Error(error.message);
          }

          const error: ApiError = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`
          }));
          
          console.error(`❌ API Error ${response.status} for ${endpoint}`);
          throw new Error(error.message || "API request failed");
        }

        const rawData = await response.json();
        
        // Handle both wrapped and unwrapped responses
        const data: ApiResponse<T> = rawData;
        return data.data ? data.data : rawData;
      } catch (error) {
        // Only log in development or if it's not a network error
        if (import.meta.env.DEV || (error instanceof Error && !error.message.includes('Failed to fetch'))) {
          console.error(`❌ API Error for ${endpoint}:`, error);
        }
        throw error;
      } finally {
        // Clean up cache after deduplication window
        setTimeout(() => {
          this.requestCache.delete(cacheKey);
        }, this.DEDUP_WINDOW);
      }
    })();

    // Store the promise for deduplication
    this.requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    return requestPromise;
  }

  // Hero Section
  async getHeroData(): Promise<HeroData> {
    return this.fetch<HeroData>("/hero");
  }

  // Research Areas
  async getResearchAreas(): Promise<ResearchArea[]> {
    return this.fetch<ResearchArea[]>("/research-areas");
  }

  async getResearchArea(id: number): Promise<ResearchArea> {
    return this.fetch<ResearchArea>(`/research-areas/${id}`);
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.fetch<TeamMember[]>("/team-members");
  }

  async getTeamMember(id: number): Promise<TeamMember> {
    return this.fetch<TeamMember>(`/team-members/${id}`);
  }

  // Publications
  async getPublications(params?: {
    search?: string;
    category?: string;
    year?: number;
  }): Promise<Publication[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.year) queryParams.append("year", params.year.toString());

    const query = queryParams.toString();
    return this.fetch<Publication[]>(`/publications${query ? `?${query}` : ""}`);
  }

  async getPublication(id: number): Promise<Publication> {
    return this.fetch<Publication>(`/publications/${id}`);
  }

  // Contact
  async getContactInfo(): Promise<ContactInfo> {
    return this.fetch<ContactInfo>("/contact-info");
  }

  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ message: string }> {
    return this.fetch<{ message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Newsletter
  async subscribeNewsletter(email: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>("/settings");
  }

  // Lab Info (public endpoint)
  async getLabInfo(): Promise<{
    lab_name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  }> {
    return this.fetch("/lab-info");
  }

  // Statistics
  async getStatistics(): Promise<{
    total_projects: number;
    team_members: number;
    publications: number;
    total_citations: number;
  }> {
    return this.fetch("/statistics");
  }

  // Timeline
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    return this.fetch<TimelineEvent[]>("/timeline");
  }

  async getTimelineEvent(id: number): Promise<TimelineEvent> {
    return this.fetch<TimelineEvent>(`/timeline/${id}`);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Export standalone functions for admin panel convenience
export const fetchResearchAreas = () => api.getResearchAreas();
export const fetchTeamMembers = () => api.getTeamMembers();
export const fetchPublications = () => api.getPublications();
export const fetchTimelineEvents = () => api.getTimelineEvents();