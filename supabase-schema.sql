-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workers table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gaming posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PS4', 'PS5')),
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  start_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id TEXT REFERENCES posts(id),
  post_name TEXT NOT NULL,
  post_type TEXT NOT NULL,
  worker_id UUID REFERENCES workers(id),
  worker_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  additional_payment DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charges table
CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('rent', 'electricity', 'internet', 'salaries', 'maintenance', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial posts
INSERT INTO posts (id, name, type) VALUES
  ('ps4-1', 'PS4 – 1', 'PS4'),
  ('ps4-2', 'PS4 – 2', 'PS4'),
  ('ps4-3', 'PS4 – 3', 'PS4'),
  ('ps4-4', 'PS4 – 4', 'PS4'),
  ('ps4-5', 'PS4 – 5', 'PS4'),
  ('ps5-1', 'PS5', 'PS5');

-- Insert default worker
INSERT INTO workers (name, pin) VALUES ('Default Worker', '1234');

-- Enable Row Level Security
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for service role)
CREATE POLICY "Allow all operations for service role" ON workers FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON posts FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON charges FOR ALL USING (true);
