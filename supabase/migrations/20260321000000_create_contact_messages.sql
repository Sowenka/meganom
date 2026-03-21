CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON contact_messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can insert" ON contact_messages
  FOR INSERT WITH CHECK (true);
