-- Create waitlist_entries table for storing email signups
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_product ON public.waitlist_entries(product_id);

-- Enable RLS
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public waitlist)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_entries
  FOR INSERT WITH CHECK (true);

-- Allow reading all entries (for count display)
CREATE POLICY "Anyone can view waitlist count" ON public.waitlist_entries
  FOR SELECT USING (false);
