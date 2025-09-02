import React from 'react';
import { BookOpen, Target, Heart, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalCourses: number;
    shortlistedCourses: number;
    totalCategories: number;
    totalSubCategories: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            <p className="text-gray-600 text-sm">Total Courses</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <Target className="w-8 h-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            <p className="text-gray-600 text-sm">Categories</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <Heart className="w-8 h-8 text-red-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.shortlistedCourses}</p>
            <p className="text-gray-600 text-sm">Shortlisted</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.totalSubCategories}</p>
            <p className="text-gray-600 text-sm">Sub Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
};