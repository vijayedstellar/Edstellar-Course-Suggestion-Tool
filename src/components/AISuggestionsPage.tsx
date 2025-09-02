import React, { useState } from 'react';
import { Sparkles, Plus, Heart, Loader2, BookOpen, Target, Lightbulb } from 'lucide-react';
import { DeepseekSuggestion } from '../types';

interface AISuggestionsPageProps {
  suggestions: DeepseekSuggestion[];
  onAddSuggestion: (suggestion: DeepseekSuggestion) => void;
  onShortlistSuggestion: (suggestion: DeepseekSuggestion) => void;
  onGetSuggestions: (category: string) => void;
  categories: Array<{ category: string; subCategories: string[] }>;
  isLoading: boolean;
}

export const AISuggestionsPage: React.FC<AISuggestionsPageProps> = ({
  suggestions,
  onAddSuggestion,
  onShortlistSuggestion,
  onGetSuggestions,
  categories,
  isLoading
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  const handleGetSuggestions = () => {
    if (selectedCategory) {
      console.log(`Requesting suggestions for category: ${selectedCategory}`);
      onGetSuggestions(selectedCategory);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Course Suggestions with Web Search</h1>
            <p className="text-gray-600">Discover current market trends and unique course ideas powered by AI with real-time web search</p>
          </div>
        </div>

        {/* Category Selection */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category for Suggestions
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Choose a category...</option>
              {categories.map(({ category }) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-6">
            <button
              onClick={handleGetSuggestions}
              disabled={!selectedCategory || isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Searching Web & Getting AI Suggestions...' : 'Get AI Suggestions with Web Search'}</span>
            </button>
          </div>
        </div>

        {selectedCategory && (
          <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-md">
            <p className="text-sm text-purple-700">
              <strong>Selected category:</strong> "{selectedCategory}". 
              Click "Get AI Suggestions with Web Search\" to discover current market trends and unique course ideas based on real-time web research.
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating AI Suggestions</h3>
          <p className="text-gray-600">
            Our AI is searching the web for current trends and creating unique course recommendations based on market demands...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Lightbulb className="w-12 h-12 text-gray-400" />
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for AI Magic</h3>
          <p className="text-gray-600 mb-4">
            Select a category above and click "Get AI Suggestions with Web Search" to discover innovative course ideas based on current market trends
          </p>
          <div className="text-sm text-gray-500">
            <p>🌐 AI searches the web for current industry trends and demands</p>
            <p>✨ Suggests courses that don't exist in your catalog</p>
            <p>🎯 Recommendations based on real-time market research</p>
            <p>📚 Each suggestion includes detailed reasoning from web findings</p>
            <p>🔄 Multiple AI providers ensure diverse and fresh suggestions</p>
          </div>
        </div>
      )}

      {/* Suggestions Table */}
      {!isLoading && suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Web-Researched AI Suggestions ({suggestions.length} unique courses)
                </h2>
              </div>
              <div className="text-sm text-gray-600">
                Category: <span className="font-medium text-purple-700">{selectedCategory}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Sub-Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Reasoning
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suggestions.map((suggestion, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                              {suggestion.course_name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {suggestion.course_overview}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {suggestion.category}
                        </span>
                        <br />
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          {suggestion.sub_category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {suggestion.reasoning && (
                        <div className="bg-yellow-50 rounded-md p-3">
                          <p className="text-xs text-gray-700 italic leading-relaxed">
                            {suggestion.reasoning}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleShortlistSuggestion(suggestion, index)}
                          disabled={shortlistingIds.has(index)}
                          className="flex items-center justify-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Add to shortlist"
                        >
                          {shortlistingIds.has(index) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Heart className="w-3 h-3" />
                          )}
                          <span>{shortlistingIds.has(index) ? 'Adding...' : 'Shortlist'}</span>
                        </button>
                        <button
                          onClick={() => handleAddSuggestion(suggestion, index)}
                          disabled={addingIds.has(index)}
                          className="flex items-center justify-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {addingIds.has(index) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          <span>{addingIds.has(index) ? 'Adding...' : 'Add to Catalog'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>🌐 All suggestions are based on current web research and market trends</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-red-600" />
                  <span>Shortlist for later</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Plus className="w-3 h-3 text-purple-600" />
                  <span>Add to catalog</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};