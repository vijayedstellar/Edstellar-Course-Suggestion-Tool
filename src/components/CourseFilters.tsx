import React from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import { CourseFilter } from '../types';

interface CourseFiltersProps {
  filter: CourseFilter;
  onFilterChange: (filter: CourseFilter) => void;
  categories: Array<{ category: string; subCategories: string[] }>;
  courses: Array<{ category: string; sub_category: string }>;
  onSuggestForCategory: (category: string, subCategory?: string) => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  filter,
  onFilterChange,
  categories,
  courses,
  onSuggestForCategory
}) => {
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filter,
      category: category || undefined,
      subCategory: undefined
    });
  };

  const handleSubCategoryChange = (subCategory: string) => {
    onFilterChange({
      ...filter,
      subCategory: subCategory || undefined
    });
  };

  const selectedCategoryData = categories.find(c => c.category === filter.category);
  
  // Calculate stats for selected category
  const getSelectedCategoryStats = () => {
    if (!filter.category) return null;
    
    const coursesInCategory = courses.filter(c => c.category === filter.category);
    const subCategoriesInCategory = [...new Set(coursesInCategory.map(c => c.sub_category))];
    
    return {
      courseCount: coursesInCategory.length,
      subCategoryCount: subCategoriesInCategory.length,
      subCategoryNames: subCategoriesInCategory
    };
  };
  
  const categoryStats = getSelectedCategoryStats();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters & AI Suggestions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value || undefined })}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filter.category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(({ category }) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filter.subCategory || ''}
          onChange={(e) => handleSubCategoryChange(e.target.value)}
          disabled={!filter.category}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">All Sub Categories</option>
          {selectedCategoryData?.subCategories.map(subCategory => (
            <option key={subCategory} value={subCategory}>
              {subCategory}
            </option>
          ))}
        </select>

        <button
          onClick={() => filter.category && onSuggestForCategory(filter.category)}
          disabled={!filter.category}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Get AI Suggestions</span>
        </button>
      </div>

      {filter.category && categoryStats && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-700">
                Selected category: "<strong>{filter.category}</strong>"
              </span>
              <span className="bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-800 font-medium">
                <strong>{categoryStats.courseCount}</strong> courses
              </span>
              <span className="bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-800 font-medium">
                <strong>{categoryStats.subCategoryCount}</strong> subcategories
              </span>
            </div>
            <div className="text-sm text-blue-700">
              <strong>Subcategories:</strong> {categoryStats.subCategoryNames.join(', ')}
            </div>
            <p className="text-xs text-blue-600">
              Click "Get AI Suggestions" to discover unique course ideas that don't exist in your current catalog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};