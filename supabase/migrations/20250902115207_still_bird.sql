/*
  # Remove Sample Courses

  1. Changes
    - Delete all sample/mock courses from the courses table
    - Keep the table structure intact
    - Reset the database to have no courses initially

  2. Notes
    - This will remove all existing course data
    - The table structure and policies remain unchanged
    - Users can start with a clean slate for their course catalog
*/

-- Remove all existing courses (sample data)
DELETE FROM courses;