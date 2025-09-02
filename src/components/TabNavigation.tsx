import React from 'react';
import { Sparkles } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'courses' | 'shortlisted' | 'ai-suggestions';
  onTabChange: (tab: 'courses' | 'shortlisted' | 'ai-suggestions') => void;
  filteredCoursesCount: number;
  shortlistedCoursesCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  filteredCoursesCount,
  shortlistedCoursesCount
}) => {
  return (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onTabChange('courses')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'courses'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        All Courses ({filteredCoursesCount})
      </button>
      <button
        onClick={() => onTabChange('shortlisted')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'shortlisted'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Shortlisted ({shortlistedCoursesCount})
      </button>
      <button
        onClick={() => onTabChange('ai-suggestions')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'ai-suggestions'
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center justify-center space-x-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Suggestions</span>
        </div>
      </button>
    </div>
  );
};