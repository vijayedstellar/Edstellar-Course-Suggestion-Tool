/*
  # Create courses table for Edstellar Course Suggestion Application

  1. New Tables
    - `courses`
      - `id` (uuid, primary key) - Unique identifier for each course
      - `course_name` (text, not null) - Name of the course
      - `category` (text, not null) - Main category (e.g., Technology, Business)
      - `sub_category` (text, not null) - Subcategory (e.g., Web Development, Marketing)
      - `course_overview` (text, not null) - Detailed description of the course
      - `created_at` (timestamptz) - When the course was created
      - `updated_at` (timestamptz) - When the course was last updated

  2. Security
    - Enable RLS on `courses` table
    - Add policy for public read access (since this is a course catalog)
    - Add policy for authenticated users to insert/update/delete courses

  3. Indexes
    - Create indexes for efficient querying by category and subcategory
    - Create index for course name searches
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name text NOT NULL,
  category text NOT NULL,
  sub_category text NOT NULL,
  course_overview text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access and authenticated write access
CREATE POLICY "Allow public read access to courses"
  ON courses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category);
CREATE INDEX IF NOT EXISTS idx_courses_sub_category ON courses (sub_category);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses USING gin(to_tsvector('english', course_name));
CREATE INDEX IF NOT EXISTS idx_courses_overview ON courses USING gin(to_tsvector('english', course_overview));

-- Insert sample data for demonstration
INSERT INTO courses (course_name, category, sub_category, course_overview) VALUES
('Advanced React Development', 'Technology', 'Web Development', 'Master advanced React concepts including hooks, context, performance optimization, and modern patterns for building scalable applications.'),
('Digital Marketing Strategy', 'Business', 'Marketing', 'Learn comprehensive digital marketing strategies including SEO, social media marketing, content marketing, and analytics to drive business growth.'),
('Data Science with Python', 'Technology', 'Data Science', 'Complete data science course covering Python programming, statistical analysis, machine learning, and data visualization techniques.'),
('Project Management Fundamentals', 'Business', 'Management', 'Essential project management skills including planning, execution, risk management, and team leadership using industry-standard methodologies.'),
('UI/UX Design Principles', 'Design', 'User Experience', 'Learn user-centered design principles, wireframing, prototyping, and usability testing to create exceptional user experiences.'),
('Cloud Computing with AWS', 'Technology', 'Cloud Computing', 'Comprehensive AWS training covering EC2, S3, Lambda, and other services for building scalable cloud applications.'),
('Financial Analysis', 'Business', 'Finance', 'Master financial statement analysis, ratio analysis, and investment evaluation techniques for informed business decision-making.'),
('Graphic Design Mastery', 'Design', 'Visual Design', 'Complete graphic design course covering typography, color theory, layout design, and industry-standard software tools.');