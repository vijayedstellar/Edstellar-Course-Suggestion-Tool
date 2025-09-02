import { Course, DeepseekSuggestion } from '../types';
import { courseService, shortlistedCourseService } from '../services/supabase';

interface UseCourseActionsProps {
  loadCourses: () => Promise<void>;
  loadShortlistedCourses: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
}

export const useCourseActions = ({
  loadCourses,
  loadShortlistedCourses,
  setIsLoading,
  setError,
  setCurrentPage
}: UseCourseActionsProps) => {
  const handleCreateCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      await courseService.createCourse(courseData);
      await loadCourses();
      setCurrentPage(1); // Reset to first page after adding course
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async (
    courseId: string,
    courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setIsLoading(true);
      await courseService.updateCourse(courseId, courseData);
      await loadCourses();
      setCurrentPage(1); // Reset to first page after updating course
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseService.deleteCourse(id);
      await loadCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course.');
    }
  };

  const handleShortlistCourse = async (course: Course, shortlistedCourseIds: Set<string>) => {
    try {
      const isCurrentlyShortlisted = course.id && shortlistedCourseIds.has(course.id);
      
      if (isCurrentlyShortlisted) {
        // Remove from shortlist - need to find the shortlisted course record
        const { data: shortlistedCourses } = await shortlistedCourseService.getAllShortlistedCourses() as any;
        const shortlistedCourse = shortlistedCourses?.find((sc: any) => sc.course_id === course.id);
        if (shortlistedCourse?.id) {
          await shortlistedCourseService.removeFromShortlist(shortlistedCourse.id);
        }
      } else {
        // Add to shortlist
        await shortlistedCourseService.shortlistCourse({
          course_id: course.id,
          course_name: course.course_name,
          category: course.category,
          sub_category: course.sub_category,
          course_overview: course.course_overview,
          source: 'catalog'
        });
      }
      
      await loadShortlistedCourses();
    } catch (err) {
      console.error('Error managing shortlist:', err);
      setError('Failed to update shortlist.');
    }
  };

  const handleShortlistSuggestion = async (suggestion: DeepseekSuggestion) => {
    try {
      await shortlistedCourseService.shortlistCourse({
        course_name: suggestion.course_name,
        category: suggestion.category,
        sub_category: suggestion.sub_category,
        course_overview: suggestion.course_overview,
        source: 'ai_suggestion'
      });
      
      await loadShortlistedCourses();
    } catch (err) {
      console.error('Error shortlisting suggestion:', err);
      setError('Failed to shortlist suggestion.');
    }
  };

  const handleRemoveFromShortlist = async (id: string) => {
    try {
      await shortlistedCourseService.removeFromShortlist(id);
      await loadShortlistedCourses();
    } catch (err) {
      console.error('Error removing from shortlist:', err);
      setError('Failed to remove from shortlist.');
    }
  };

  const handleBulkUpload = async (courses: Omit<Course, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      setIsLoading(true);
      console.log(`Dashboard: Starting bulk upload of ${courses.length} courses`);
      await courseService.bulkCreateCourses(courses);
      console.log('Dashboard: Bulk upload completed, reloading courses');
      await loadCourses();
      setCurrentPage(1); // Reset to first page after bulk upload
      alert(`Successfully uploaded ${courses.length} courses!`);
    } catch (err) {
      console.error('Error bulk uploading courses:', err);
      setError(`Failed to upload courses: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = async (suggestion: DeepseekSuggestion) => {
    await handleCreateCourse({
      course_name: suggestion.course_name,
      category: suggestion.category,
      sub_category: suggestion.sub_category,
      course_overview: suggestion.course_overview
    });
  };

  return {
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleShortlistCourse,
    handleShortlistSuggestion,
    handleRemoveFromShortlist,
    handleBulkUpload,
    handleAddSuggestion
  };
};