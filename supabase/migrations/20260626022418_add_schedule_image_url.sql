-- Add image_url column to schedules table to store schedule-specific bus images
ALTER TABLE schedules
ADD COLUMN image_url TEXT;
-- Add comment to clarify this is for schedule-specific images
COMMENT ON COLUMN schedules.image_url IS 'Schedule-specific bus image URL, separate from the bus global image';