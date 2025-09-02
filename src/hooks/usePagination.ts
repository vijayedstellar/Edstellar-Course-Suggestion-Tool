import { useState, useEffect } from 'react';
import { Course, CourseFilter } from '../types';

export const usePagination = (courses: Course[]) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [paginatedCourses, setPaginatedCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(10);
  const [filter, setFilter] = useState<CourseFilter>({});

  const applyFilters = () => {
    let filtered = [...courses];

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.course_name.toLowerCase().includes(query) ||
        course.course_overview.toLowerCase().includes(query)
      );
    }

    if (filter.category) {
      filtered = filtered.filter(course => course.category === filter.category);
    }

    if (filter.subCategory) {
      filtered = filtered.filter(course => course.sub_category === filter.subCategory);
    }

    setFilteredCourses(filtered);
  };

  const applyPagination = () => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const paginated = filteredCourses.slice(startIndex, endIndex);
    setPaginatedCourses(paginated);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCoursesPerPageChange = (newCoursesPerPage: number) => {
    setCoursesPerPage(newCoursesPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  useEffect(() => {
    applyFilters();
  }, [courses, filter]);

  useEffect(() => {
    applyPagination();
  }, [filteredCourses, currentPage, coursesPerPage]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage + 1;
  const endIndex = Math.min(currentPage * coursesPerPage, filteredCourses.length);

  return {
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
  };
};