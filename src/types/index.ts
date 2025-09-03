export interface Course {
  id?: string;
  course_name: string;
  category: string;
  sub_category: string;
  course_overview: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseFilter {
  category?: string;
  subCategory?: string;
  searchQuery?: string;
}

export interface DeepseekSuggestion {
  course_name: string;
  category: string;
  sub_category: string;
  course_overview: string;
  reasoning?: string;
}

export interface ShortlistedCourse {
  id?: string;
  course_id?: string;
  course_name: string;
  category: string;
  sub_category: string;
  course_overview: string;
  shortlisted_at?: string;
  source: 'catalog' | 'ai_suggestion';
  content_type: 'Blog' | 'Course';
  comments?: string;
}