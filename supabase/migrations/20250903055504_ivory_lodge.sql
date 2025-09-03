/*
  # Add Content Type and Comments to Shortlisted Courses

  1. Schema Changes
    - Add `content_type` column to shortlisted_courses table (Blog/Course)
    - Add `comments` column to shortlisted_courses table (user comments)
    - Set default values for existing records

  2. Data Migration
    - Set default content_type to 'Course' for existing records
    - Set default comments to empty string for existing records

  3. Constraints
    - content_type must be either 'Blog' or 'Course'
    - comments can be null or empty
*/

-- Add new columns to shortlisted_courses table
DO $$
BEGIN
  -- Add content_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shortlisted_courses' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE shortlisted_courses ADD COLUMN content_type text NOT NULL DEFAULT 'Course' CHECK (content_type IN ('Blog', 'Course'));
  END IF;

  -- Add comments column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shortlisted_courses' AND column_name = 'comments'
  ) THEN
    ALTER TABLE shortlisted_courses ADD COLUMN comments text DEFAULT '';
  END IF;
END $$;

-- Update existing records to have default values
UPDATE shortlisted_courses 
SET content_type = 'Course', comments = ''
WHERE content_type IS NULL OR comments IS NULL;

-- Create index for content_type filtering
CREATE INDEX IF NOT EXISTS idx_shortlisted_courses_content_type ON shortlisted_courses (content_type);