-- Run this SQL in Supabase SQL Editor to create all tables

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  aliexpress_product_id TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  times_sent INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chat_id TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_messages_per_day INTEGER DEFAULT 3,
  preferred_categories TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'he',
  message_prefix TEXT,
  message_suffix TEXT,
  member_count INTEGER,
  total_messages_sent INTEGER DEFAULT 0,
  last_message_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  send_times JSONB NOT NULL DEFAULT '[]',
  days_of_week INTEGER[] DEFAULT '{}',
  products_per_slot INTEGER DEFAULT 1,
  product_selection_strategy TEXT DEFAULT 'least_sent'
    CHECK (product_selection_strategy IN ('round_robin', 'random', 'least_sent', 'newest')),
  category_filter TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message logs table
CREATE TABLE message_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  green_api_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  message_content TEXT,
  sent_at TIMESTAMPTZ,
  trigger_type TEXT DEFAULT 'scheduled' CHECK (trigger_type IN ('scheduled', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_active ON products(is_active, last_sent_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_schedules_active ON schedules(is_active);
CREATE INDEX idx_schedules_group ON schedules(group_id);
CREATE INDEX idx_message_logs_group ON message_logs(group_id, created_at DESC);
CREATE INDEX idx_message_logs_status ON message_logs(status);
CREATE INDEX idx_message_logs_sent ON message_logs(sent_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
