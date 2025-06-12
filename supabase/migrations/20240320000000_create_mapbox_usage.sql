-- Create mapbox_usage table
CREATE TABLE IF NOT EXISTS mapbox_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count INTEGER NOT NULL DEFAULT 0,
    search_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create or replace the function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_mapbox_usage_updated_at ON mapbox_usage;

-- Create the trigger
CREATE TRIGGER update_mapbox_usage_updated_at
    BEFORE UPDATE ON mapbox_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial record if it doesn't exist
INSERT INTO mapbox_usage (count, search_count) 
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM mapbox_usage); 