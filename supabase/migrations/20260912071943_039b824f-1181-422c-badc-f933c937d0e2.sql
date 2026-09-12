ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.guard_seller_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved','rejected')
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only an admin can change approval status';
  END IF;
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only an admin can change verification';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Cannot transfer seller ownership';
  END IF;
  RETURN NEW;
END; $function$;

-- Saved sellers (customer favourites)
CREATE TABLE public.saved_sellers (
  user_id uuid NOT NULL,
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, seller_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_sellers TO authenticated;
GRANT ALL ON public.saved_sellers TO service_role;
ALTER TABLE public.saved_sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON public.saved_sellers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Lightweight analytics
CREATE TYPE public.seller_event AS ENUM ('view','whatsapp','call','instagram','share','save');
CREATE TABLE public.seller_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  event public.seller_event NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX seller_events_seller_idx ON public.seller_events (seller_id, created_at DESC);
GRANT INSERT ON public.seller_events TO anon, authenticated;
GRANT ALL ON public.seller_events TO service_role;
ALTER TABLE public.seller_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record events for approved sellers" ON public.seller_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.status = 'approved'));

CREATE OR REPLACE FUNCTION public.my_seller_stats(_seller_id uuid)
 RETURNS TABLE(event public.seller_event, total bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT e.event, count(*)::bigint
  FROM public.seller_events e
  WHERE e.seller_id = _seller_id
    AND e.created_at > now() - interval '30 days'
    AND EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = _seller_id
        AND (s.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  GROUP BY e.event;
$$;
REVOKE ALL ON FUNCTION public.my_seller_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_seller_stats(uuid) TO authenticated;

-- Listing reports
CREATE TABLE public.seller_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.seller_reports TO anon, authenticated;
GRANT SELECT, DELETE ON public.seller_reports TO authenticated;
GRANT ALL ON public.seller_reports TO service_role;
ALTER TABLE public.seller_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report approved sellers" ON public.seller_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(trim(reason)) BETWEEN 5 AND 500
    AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.status = 'approved'));
CREATE POLICY "Admins view reports" ON public.seller_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reports" ON public.seller_reports
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));