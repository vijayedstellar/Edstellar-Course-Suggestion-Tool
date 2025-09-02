import { useState, useEffect } from 'react';
import { Course, ShortlistedCourse, DeepseekSuggestion } from '../types';
import { courseService, shortlistedCourseService } from '../services/supabase';
import { AIRecommendationService } from '../services/aiRecommendationService';

export const useCourseData = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [shortlistedCourses, setShortlistedCourses] = useState<ShortlistedCourse[]>([]);
  const [shortlistedCourseIds, setShortlistedCourseIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Array<{ category: string; subCategories: string[] }>>([]);
  const [suggestions, setSuggestions] = useState<DeepseekSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isShortlistLoading, setIsShortlistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize AI Recommendation service
  const [aiService, setAiService] = useState<AIRecommendationService | null>(null);

  useEffect(() => {
    try {
      const service = new AIRecommendationService();
      setAiService(service);
      console.log('Available AI providers:', service.getAvailableProviders());
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      setError('AI recommendation service is not configured. Please check your API keys.');
    }
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading courses from database...');
      const coursesData = await courseService.getAllCourses();
      console.log(`Dashboard: Loaded ${coursesData.length} courses`);
      setCourses(coursesData);
      
      const categoriesData = await courseService.getCategoriesAndSubcategories();
      console.log(`Dashboard: Found ${categoriesData.length} categories`);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadShortlistedCourses = async () => {
    try {
      setIsShortlistLoading(true);
      const shortlistedData = await shortlistedCourseService.getAllShortlistedCourses();
      setShortlistedCourses(shortlistedData);
      
      // Create a set of shortlisted course IDs for quick lookup
      const shortlistedIds = new Set<string>();
      shortlistedData.forEach(course => {
        if (course.course_id) {
          shortlistedIds.add(course.course_id);
        }
        // Also add a composite key for AI suggestions
        shortlistedIds.add(`${course.course_name}-${course.category}-${course.sub_category}`);
      });
      setShortlistedCourseIds(shortlistedIds);
    } catch (err) {
      console.error('Error loading shortlisted courses:', err);
    } finally {
      setIsShortlistLoading(false);
    }
  };

  const handleSuggestForCategory = async (category: string) => {
    if (!aiService) {
      setError('AI recommendation service is not available. Please check your API key configuration.');
      return;
    }

    try {
      setIsSuggestionsLoading(true);
      setError(null);
      console.log(`Getting AI suggestions for category: ${category}`);
      
      // Get existing course names to avoid duplicates
      const existingCourseNames = courses.map(c => c.course_name);
      
      console.log(`Found ${existingCourseNames.length} existing courses to avoid duplicates`);
      
      const result = await aiService.getSuggestions(category, existingCourseNames);
      const { suggestions: newSuggestions, provider } = result;
      
      console.log(`Received ${newSuggestions.length} suggestions from ${provider}`);
      
      // Additional client-side validation to ensure no duplicates or similar courses
      const filteredSuggestions = newSuggestions.filter(suggestion => {
        const suggestionName = suggestion.course_name.toLowerCase().trim();
        
        // Check for exact matches
        const isExactDuplicate = existingCourseNames.some(existing => 
          existing.toLowerCase().trim() === suggestionName
        );
        
        // Check for semantic similarity (basic keyword overlap detection)
        const isSemanticallyDuplicate = existingCourseNames.some(existing => {
          const existingWords = existing.toLowerCase().split(/\s+/);
          const suggestionWords = suggestionName.split(/\s+/);
          
          // If more than 60% of words overlap, consider it a duplicate
          const commonWords = existingWords.filter(word => 
            suggestionWords.includes(word) && word.length > 3 // Only consider meaningful words
          );
          const overlapPercentage = commonWords.length / Math.min(existingWords.length, suggestionWords.length);
          
          return overlapPercentage > 0.6;
        });
        
        const isDuplicate = isExactDuplicate || isSemanticallyDuplicate;
        
        if (isDuplicate) {
          console.warn(`Filtered out duplicate/similar suggestion: "${suggestion.course_name}"`);
        }
        
        return !isDuplicate;
      });
      
      console.log(`Generated ${filteredSuggestions.length} unique suggestions for "${category}" using ${provider}`);
      setSuggestions(filteredSuggestions);
      
      if (filteredSuggestions.length === 0) {
        setError(`No unique course suggestions could be generated for "${category}" using ${provider}. Try clicking "Get AI Suggestions" again to use a different AI provider, or try a different category.`);
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
      setError(`Failed to get AI suggestions: ${err instanceof Error ? err.message : 'Unknown error'}. Try again to use a different AI provider.`);
      setSuggestions([]);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadShortlistedCourses();
  }, []);

  return {
    courses,
    setCourses,
    shortlistedCourses,
    shortlistedCourseIds,
    categories,
    suggestions,
    setSuggestions,
    isLoading,
    setIsLoading,
    isSuggestionsLoading,
    isShortlistLoading,
    error,
    setError,
    loadCourses,
    loadShortlistedCourses,
    handleSuggestForCategory
  };
};