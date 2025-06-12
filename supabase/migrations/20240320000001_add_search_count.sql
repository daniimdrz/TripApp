-- Add search_count column
ALTER TABLE mapbox_usage 
ADD COLUMN IF NOT EXISTS search_count INTEGER NOT NULL DEFAULT 0;

-- Update existing record to have search_count = 0
UPDATE mapbox_usage 
SET search_count = 0 
WHERE search_count IS NULL; 