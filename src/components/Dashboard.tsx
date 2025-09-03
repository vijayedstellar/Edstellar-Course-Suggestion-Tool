import React, { useState } from 'react';
import { Course, DeepseekSuggestion } from '../types';
import { StatsCards } from './StatsCards';
import { TabNavigation } from './TabNavigation';
import { CourseFilters } from './CourseFilters';
import { PaginationControls } from './PaginationControls';
import { CourseGrid } from './CourseGrid';
import { AISuggestionsPage } from './AISuggestionsPage';
import { ShortlistedCourses } from './ShortlistedCourses';
import { CourseForm } from './CourseForm';
import { CSVUpload } from './CSVUpload';
import { useCourseData } from '../hooks/useCourseData';
import { useCourseActions } from '../hooks/useCourseActions';
import { usePagination } from '../hooks/usePagination';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'shortlisted' | 'ai-suggestions'>('courses');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  // Custom hooks for data management
  const {
    courses,
    shortlistedCourses,
    shortlistedCourseIds,
    categories,
    suggestions,
    setSuggestions,
    isLoading,
    setIsLoading,
    isSuggestionsLoading,
    isShortlistLoading,
    error,
    setError,
    loadCourses,
    loadShortlistedCourses,
    handleSuggestForCategory
  } = useCourseData();

  // Pagination hook
  const {
    filteredCourses,
    paginatedCourses,
    currentPage,
    setCurrentPage,
    coursesPerPage,
    filter,
    setFilter,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handleCoursesPerPageChange
  } = usePagination(courses);

  // Course actions hook
  const {
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleShortlistCourse,
    handleShortlistSuggestion,
    handleRemoveFromShortlist,
    handleBulkUpload,
    handleAddSuggestion
  } = useCourseActions({
    loadCourses,
    loadShortlistedCourses,
    setIsLoading,
    setError,
    setCurrentPage
  });

  // Form handlers
  const handleFormSubmit = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingCourse?.id) {
      await handleUpdateCourse(editingCourse.id, courseData);
    } else {
      await handleCreateCourse(courseData);
    }
    setIsFormOpen(false);
    setEditingCourse(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCourse(undefined);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleAddCourse = () => {
    setIsFormOpen(true);
  };

  const handleBulkUploadClick = () => {
    setIsCSVUploadOpen(true);
  };

  const handleCSVUploadClose = () => {
    setIsCSVUploadOpen(false);
  };

  const handleSuggestForCategoryWithTab = async (category: string, subCategory?: string) => {
    await handleSuggestForCategory(category, subCategory);
    setActiveTab('ai-suggestions'); // Switch to AI suggestions tab after getting results
  };

  const handleShortlistCourseWrapper = (course: Course) => {
    // This will be handled by the CourseCard component's modal
  };

  const handleShortlistCourseWithDetails = (course: Course, contentType: 'Blog' | 'Course', comments: string) => {
    handleShortlistCourse(course, shortlistedCourseIds, contentType, comments);
  };

  // Calculate stats
  const stats = {
    totalCourses: courses.length,
    shortlistedCourses: shortlistedCourses.length,
    totalCategories: categories.length,
    totalSubCategories: categories.reduce((acc, cat) => acc + cat.subCategories.length, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edstellar Course Management
          </h1>
          <p className="text-gray-600">
            Manage your course catalog and discover new opportunities with AI-powered suggestions
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        {activeTab === 'courses' && (
          <CourseFilters
            filter={filter}
            onFilterChange={setFilter}
            categories={categories}
            courses={courses}
            onSuggestForCategory={handleSuggestForCategoryWithTab}
          />
        )}

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filteredCoursesCount={filteredCourses.length}
          shortlistedCoursesCount={shortlistedCourses.length}
        />

        {/* Content based on active tab */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Pagination Controls */}
            <div className="xl:col-span-3">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                coursesPerPage={coursesPerPage}
                totalCourses={filteredCourses.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={handlePageChange}
                onCoursesPerPageChange={handleCoursesPerPageChange}
              />
            </div>

            {/* Course Grid */}
            <CourseGrid
              courses={paginatedCourses}
              filteredCoursesCount={filteredCourses.length}
              shortlistedCourseIds={shortlistedCourseIds}
              isLoading={isLoading}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onShortlist={handleShortlistCourseWithDetails}
              onAddCourse={handleAddCourse}
              onBulkUpload={handleBulkUploadClick}
            />
          </div>
        )}

        {activeTab === 'shortlisted' && (
          <ShortlistedCourses
            shortlistedCourses={shortlistedCourses}
            onRemoveFromShortlist={handleRemoveFromShortlist}
            isLoading={isShortlistLoading}
          />
        )}

        {activeTab === 'ai-suggestions' && (
          <AISuggestionsPage
            suggestions={suggestions}
            onAddSuggestion={handleAddSuggestion}
            onShortlistSuggestion={handleShortlistSuggestion}
            onGetSuggestions={handleSuggestForCategory}
            categories={categories}
            isLoading={isSuggestionsLoading}
          />
        )}

        {/* Course Form Modal */}
        {isFormOpen && (
          <CourseForm
            course={editingCourse}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )}

        {/* CSV Upload Modal */}
        {isCSVUploadOpen && (
          <CSVUpload
            onUpload={handleBulkUpload}
            onClose={handleCSVUploadClose}
            isUploading={isLoading}
          />
        )}
      </div>
    </div>
  );
};