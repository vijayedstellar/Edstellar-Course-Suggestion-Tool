import React from 'react';
import { Heart, X, BookOpen, Calendar, FileText, MessageSquare } from 'lucide-react';
import { ShortlistedCourse } from '../types';

interface ShortlistedCoursesProps {
  shortlistedCourses: ShortlistedCourse[];
  onRemoveFromShortlist: (id: string) => void;
  isLoading?: boolean;
}

export const ShortlistedCourses: React.FC<ShortlistedCoursesProps> = ({
  shortlistedCourses,
  onRemoveFromShortlist,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Loading shortlisted courses...</p>
        </div>
      </div>
    );
  }

  if (shortlistedCourses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shortlisted Courses</h3>
        <p className="text-gray-600">
          Start shortlisting courses by clicking the heart icon on course cards or AI suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Heart className="w-5 h-5 text-red-600 fill-current" />
        <h3 className="text-lg font-semibold text-gray-900">
          Shortlisted Courses ({shortlistedCourses.length})
        </h3>
      </div>

      {shortlistedCourses.map((course) => (
        <div
          key={course.id}
          className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-red-600" />
              <h4 className="text-lg font-semibold text-gray-900">
                {course.course_name}
              </h4>
            </div>
            <button
              onClick={() => course.id && onRemoveFromShortlist(course.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
              title="Remove from shortlist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {course.category}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {course.sub_category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${
              course.content_type === 'Course' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              <FileText className="w-3 h-3" />
              <span>{course.content_type}</span>
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.source === 'catalog' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {course.source === 'catalog' ? 'From Catalog' : 'AI Suggestion'}
            </span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {course.course_overview}
          </p>

          {course.comments && course.comments.trim() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">Comments:</p>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {course.comments}
                  </p>
                </div>
              </div>
            </div>
          )}

          {course.shortlisted_at && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                Shortlisted on {new Date(course.shortlisted_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};