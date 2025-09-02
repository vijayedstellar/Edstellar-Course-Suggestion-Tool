import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Course, ShortlistedCourse } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    console.log('Loading courses from database using pagination...');
    
    // First, get the total count
    const { count, error: countError } = await supabaseClient
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting course count:', countError);
      throw countError;
    }
    
    console.log(`Total courses in database: ${count}`);
    
    if (!count || count === 0) {
      return [];
    }
    
    // Fetch all courses using pagination
    const allCourses: Course[] = [];
    const pageSize = 1000; // Supabase's safe limit per request
    const totalPages = Math.ceil(count / pageSize);
    
    console.log(`Fetching ${count} courses in ${totalPages} pages of ${pageSize} each`);
    
    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize - 1;
      
      console.log(`Fetching page ${page + 1}/${totalPages} (rows ${startIndex}-${endIndex})`);
      
      const { data, error } = await supabaseClient
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);
      
      if (error) {
        console.error(`Error fetching page ${page + 1}:`, error);
        throw error;
      }
      
      if (data && data.length > 0) {
        allCourses.push(...data);
        console.log(`Page ${page + 1} fetched: ${data.length} courses (total so far: ${allCourses.length})`);
      }
      
      // Small delay between requests to avoid rate limiting
      if (page < totalPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log(`Successfully fetched all ${allCourses.length} courses from database`);
    
    // Verify we got all courses
    if (allCourses.length !== count) {
      console.warn(`Expected ${count} courses but got ${allCourses.length}`);
    }
    
    return allCourses;
  },

  async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const { data, error } = await supabaseClient
      .from('courses')
      .insert(course)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabaseClient
      .from('courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkCreateCourses(courses: Omit<Course, 'id' | 'created_at' | 'updated_at'>[]): Promise<Course[]> {
    // Supabase has a limit on bulk inserts, so we'll process in batches
    const BATCH_SIZE = 1000; // Supabase's recommended batch size
    const allInsertedCourses: Course[] = [];
    
    console.log(`Starting bulk upload of ${courses.length} courses in batches of ${BATCH_SIZE}`);
    
    for (let i = 0; i < courses.length; i += BATCH_SIZE) {
      const batch = courses.slice(i, i + BATCH_SIZE);
      console.log(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(courses.length / BATCH_SIZE)} (${batch.length} courses)`);
      
      const { data, error } = await supabaseClient
        .from('courses')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
        throw error;
      }
      
      if (data) {
        allInsertedCourses.push(...data);
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < courses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Successfully uploaded ${allInsertedCourses.length} courses`);
    return allInsertedCourses;
  },

  async getCategoriesAndSubcategories() {
    const { data, error } = await supabaseClient
      .from('courses')
      .select('category, sub_category');
    
    if (error) throw error;
    
    const categories = new Map<string, Set<string>>();
    data?.forEach(course => {
      if (!categories.has(course.category)) {
        categories.set(course.category, new Set());
      }
      categories.get(course.category)?.add(course.sub_category);
    });
    
    return Array.from(categories.entries()).map(([category, subCategories]) => ({
      category,
      subCategories: Array.from(subCategories)
    }));
  }
};

export const shortlistedCourseService = {
  async getAllShortlistedCourses(): Promise<ShortlistedCourse[]> {
    const { data, error } = await supabaseClient
      .from('shortlisted_courses')
      .select('*')
      .order('shortlisted_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async shortlistCourse(course: Omit<ShortlistedCourse, 'id' | 'shortlisted_at'>): Promise<ShortlistedCourse> {
    const { data, error } = await supabaseClient
      .from('shortlisted_courses')
      .insert(course)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFromShortlist(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('shortlisted_courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async isCourseShorlisted(courseId?: string, courseName?: string, category?: string, subCategory?: string): Promise<boolean> {
    let query = supabaseClient.from('shortlisted_courses').select('id');
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    } else if (courseName && category && subCategory) {
      query = query
        .eq('course_name', courseName)
        .eq('category', category)
        .eq('sub_category', subCategory);
    } else {
      return false;
    }
    
    const { data, error } = await query.limit(1);
    
    if (error) throw error;
    return (data?.length || 0) > 0;
  }
};