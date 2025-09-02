/*
  # Create shortlisted_courses table

  1. New Tables
    - `shortlisted_courses`
      - `id` (uuid, primary key) - Unique identifier for each shortlisted entry
      - `course_id` (uuid, foreign key) - Reference to the original course
      - `course_name` (text, not null) - Name of the shortlisted course
      - `category` (text, not null) - Course category
      - `sub_category` (text, not null) - Course subcategory
      - `course_overview` (text, not null) - Course description
      - `shortlisted_at` (timestamptz) - When the course was shortlisted
      - `source` (text) - Source of the course ('catalog' or 'ai_suggestion')

  2. Security
    - Enable RLS on `shortlisted_courses` table
    - Add policy for public access to match courses table

  3. Indexes
    - Create index for efficient querying by course_id
    - Create index for category filtering
*/

CREATE TABLE IF NOT EXISTS shortlisted_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  category text NOT NULL,
  sub_category text NOT NULL,
  course_overview text NOT NULL,
  shortlisted_at timestamptz DEFAULT now(),
  source text NOT NULL DEFAULT 'catalog' CHECK (source IN ('catalog', 'ai_suggestion'))
);

-- Enable Row Level Security
ALTER TABLE shortlisted_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to shortlisted_courses"
  ON shortlisted_courses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to shortlisted_courses"
  ON shortlisted_courses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to shortlisted_courses"
  ON shortlisted_courses
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to shortlisted_courses"
  ON shortlisted_courses
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shortlisted_courses_course_id ON shortlisted_courses (course_id);
CREATE INDEX IF NOT EXISTS idx_shortlisted_courses_category ON shortlisted_courses (category);
CREATE INDEX IF NOT EXISTS idx_shortlisted_courses_source ON shortlisted_courses (source);

-- Create unique constraint to prevent duplicate shortlisting
CREATE UNIQUE INDEX IF NOT EXISTS idx_shortlisted_courses_unique 
ON shortlisted_courses (course_id, course_name, category, sub_category) 
WHERE course_id IS NOT NULL;