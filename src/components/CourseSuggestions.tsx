import React, { useState } from 'react';
import { Sparkles, Plus, Loader2, Heart } from 'lucide-react';
import { DeepseekSuggestion, Course } from '../types';

interface CourseSuggestionsProps {
  suggestions: DeepseekSuggestion[];
  onAddSuggestion: (suggestion: DeepseekSuggestion) => void;
  onShortlistSuggestion: (suggestion: DeepseekSuggestion) => void;
  isLoading: boolean;
}

export const CourseSuggestions: React.FC<CourseSuggestionsProps> = ({
  suggestions,
  onAddSuggestion,
  onShortlistSuggestion,
  isLoading
}) => {
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [shortlistingIds, setShortlistingIds] = useState<Set<number>>(new Set());

  const handleAddSuggestion = async (suggestion: DeepseekSuggestion, index: number) => {
    setAddingIds(prev => new Set(prev).add(index));
    try {
      await onAddSuggestion(suggestion);
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleShortlistSuggestion = async (suggestion: DeepseekSuggestion, index: number) => {
    setShortlistingIds(prev => new Set(prev).add(index));
    try {
      await onShortlistSuggestion(suggestion);
    } finally {
      setShortlistingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Getting AI suggestions...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Select a category to get AI-powered course suggestions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Course Suggestions (Unique Only)</h3>
      </div>

      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold text-gray-900 pr-4">
              {suggestion.course_name}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => handleShortlistSuggestion(suggestion, index)}
                disabled={shortlistingIds.has(index)}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add to shortlist"
              >
                {shortlistingIds.has(index) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                <span>{shortlistingIds.has(index) ? 'Shortlisting...' : 'Shortlist'}</span>
              </button>
              <button
                onClick={() => handleAddSuggestion(suggestion, index)}
                disabled={addingIds.has(index)}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingIds.has(index) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{addingIds.has(index) ? 'Adding...' : 'Add'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {suggestion.category}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {suggestion.sub_category}
            </span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {suggestion.course_overview}
          </p>

          {suggestion.reasoning && (
            <div className="bg-white bg-opacity-60 rounded-md p-3 mt-3">
              <p className="text-xs text-gray-600 italic">
                <strong>Why this course:</strong> {suggestion.reasoning}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};