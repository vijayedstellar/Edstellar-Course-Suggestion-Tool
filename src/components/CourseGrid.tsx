import React from 'react';
import { Plus, Upload, BookOpen } from 'lucide-react';
import { Course } from '../types';
import { CourseCard } from './CourseCard';

interface CourseGridProps {
  courses: Course[];
  filteredCoursesCount: number;
  shortlistedCourseIds: Set<string>;
  isLoading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onShortlist: (course: Course, contentType: 'Blog' | 'Course', comments: string) => void;
  onAddCourse: () => void;
  onBulkUpload: () => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  filteredCoursesCount,
  shortlistedCourseIds,
  isLoading,
  onEdit,
  onDelete,
  onShortlist,
  onAddCourse,
  onBulkUpload
}) => {
  return (
    <div className="xl:col-span-3">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Courses ({filteredCoursesCount})
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={onBulkUpload}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={onAddCourse}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={onEdit}
              onDelete={onDelete}
              onShortlist={onShortlist}
              isShortlisted={course.id ? shortlistedCourseIds.has(course.id) : false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search query, or get started by adding your first course
          </p>
          <button
            onClick={onAddCourse}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add First Course
          </button>
        </div>
      )}
    </div>
  );
};