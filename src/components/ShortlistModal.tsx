import React, { useState } from 'react';
import { X, Heart, MessageSquare, FileText } from 'lucide-react';
import { Course, DeepseekSuggestion } from '../types';

interface ShortlistModalProps {
  course?: Course;
  suggestion?: DeepseekSuggestion;
  onConfirm: (contentType: 'Blog' | 'Course', comments: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ShortlistModal: React.FC<ShortlistModalProps> = ({
  course,
  suggestion,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [contentType, setContentType] = useState<'Blog' | 'Course'>('Course');
  const [comments, setComments] = useState('');

  const courseName = course?.course_name || suggestion?.course_name || '';
  const category = course?.category || suggestion?.category || '';
  const subCategory = course?.sub_category || suggestion?.sub_category || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(contentType, comments);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Add to Shortlist
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Course Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{courseName}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {category}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {subCategory}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Content Type *</span>
              </div>
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as 'Blog' | 'Course')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="Course">Course</option>
              <option value="Blog">Blog</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select whether this should be developed as a course or blog content
            </p>
          </div>

          {/* Comments Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Comments</span>
              </div>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Add any notes, requirements, or additional context for this shortlisted item..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add notes about why you're shortlisting this or any specific requirements
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding to Shortlist...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Add to Shortlist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};