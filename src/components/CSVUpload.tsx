import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Course } from '../types';

interface CSVUploadProps {
  onUpload: (courses: Omit<Course, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  onClose: () => void;
  isUploading?: boolean;
}

interface ParsedCourse {
  course_name: string;
  category: string;
  sub_category: string;
  course_overview: string;
  rowNumber: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload, onClose, isUploading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedCourses, setParsedCourses] = useState<ParsedCourse[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    
    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 2) {
        alert('CSV file must contain at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const expectedHeaders = ['Course Name', 'Category', 'Sub Category', 'Course Overview'];
      
      // Validate headers
      const headerMismatch = expectedHeaders.some(expected => 
        !headers.some(header => header.toLowerCase() === expected.toLowerCase())
      );
      
      if (headerMismatch) {
        alert(`CSV headers must be exactly: ${expectedHeaders.join(', ')}`);
        return;
      }

      const courses: ParsedCourse[] = [];
      const errors: ValidationError[] = [];

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const rowNumber = i + 1;

        if (values.length !== 4) {
          errors.push({
            row: rowNumber,
            field: 'general',
            message: `Expected 4 columns, found ${values.length}`
          });
          continue;
        }

        const [courseName, category, subCategory, courseOverview] = values;

        // Validate required fields
        if (!courseName.trim()) {
          errors.push({
            row: rowNumber,
            field: 'Course Name',
            message: 'Course Name is required'
          });
        }
        if (!category.trim()) {
          errors.push({
            row: rowNumber,
            field: 'Category',
            message: 'Category is required'
          });
        }
        if (!subCategory.trim()) {
          errors.push({
            row: rowNumber,
            field: 'Sub Category',
            message: 'Sub Category is required'
          });
        }
        if (!courseOverview.trim()) {
          errors.push({
            row: rowNumber,
            field: 'Course Overview',
            message: 'Course Overview is required'
          });
        }

        courses.push({
          course_name: courseName.trim(),
          category: category.trim(),
          sub_category: subCategory.trim(),
          course_overview: courseOverview.trim(),
          rowNumber
        });
      }

      setParsedCourses(courses);
      setValidationErrors(errors);
      setStep('preview');
    };

    reader.readAsText(file);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, ''));
  };

  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before uploading');
      return;
    }

    const coursesToUpload = parsedCourses.map(course => ({
      course_name: course.course_name,
      category: course.category,
      sub_category: course.sub_category,
      course_overview: course.course_overview
    }));

    console.log(`Preparing to upload ${coursesToUpload.length} courses`);

    try {
      await onUpload(coursesToUpload);
      setStep('success');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Course Name,Category,Sub Category,Course Overview\n"Advanced React Development","Technology","Web Development","Master advanced React concepts including hooks, context, and performance optimization"\n"Digital Marketing Strategy","Business","Marketing","Learn comprehensive digital marketing strategies including SEO and social media"';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            CSV Bulk Upload
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors mb-4"
              >
                <FileText className="w-4 h-4" />
                <span>Download CSV Template</span>
              </button>
              <p className="text-sm text-gray-600">
                Download the template to see the required format
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your CSV file here
              </p>
              <p className="text-gray-600 mb-4">
                or click to browse files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Headers must be: Course Name, Category, Sub Category, Course Overview</li>
                <li>• All fields are required</li>
                <li>• Use commas to separate values</li>
                <li>• Wrap values containing commas in quotes</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Preview ({parsedCourses.length} courses)
                </h3>
                <p className="text-sm text-gray-600">
                  Review your data before uploading
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={validationErrors.length > 0 || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Upload Courses'}
                </button>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-900">
                    Validation Errors ({validationErrors.length})
                  </h4>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      Row {error.row}: {error.field} - {error.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Course Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sub Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Course Overview
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedCourses.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {course.course_name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {course.category}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {course.sub_category}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                          {course.course_overview}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              {parsedCourses.length} courses have been added to your catalog.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};