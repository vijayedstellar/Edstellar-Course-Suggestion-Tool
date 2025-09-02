import React from 'react';
import { Edit2, Trash2, BookOpen, Heart } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onShortlist: (course: Course) => void;
  isShortlisted?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onEdit, 
  onDelete, 
  onShortlist, 
  isShortlisted = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {course.course_name}
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onShortlist(course)}
            className={`p-2 rounded-md transition-colors ${
              isShortlisted
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          >
            <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onEdit(course)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => course.id && onDelete(course.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {course.category}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            {course.sub_category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
        {course.course_overview}
      </p>

      {course.created_at && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Created {new Date(course.created_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};