-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'seller');
CREATE TYPE public.seller_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE public.day_status AS ENUM ('open', 'closed', 'holiday');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.categories (name, slug, sort_order) VALUES
 ('Mehendi','mehendi',1),('Makeup','makeup',2),('Bridal','bridal',3),('Crochet','crochet',4),
 ('Bakery','bakery',5),('Boutique','boutique',6),('Gift Hampers','gift-hampers',7),
 ('Decor','decor',8),('Artists','artists',9),('Other','other',10);

-- sellers
CREATE TABLE public.sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  base_location text NOT NULL,
  description text,
  instagram_id text NOT NULL,
  profile_image_url text,
  status public.seller_status NOT NULL DEFAULT 'draft',
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sellers_status_idx ON public.sellers (status);
CREATE INDEX sellers_category_idx ON public.sellers (category_id);
GRANT SELECT ON public.sellers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
GRANT ALL ON public.sellers TO service_role;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER sellers_updated_at BEFORE UPDATE ON public.sellers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view approved sellers" ON public.sellers FOR SELECT TO anon, authenticated
USING (status = 'approved');
CREATE POLICY "Sellers can view own seller" ON public.sellers FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Sellers can create own seller" ON public.sellers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND status IN ('draft','pending'));
CREATE POLICY "Sellers can update own seller" ON public.sellers FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage sellers" ON public.sellers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sellers can only move to draft/pending; only admins may approve/reject.
CREATE OR REPLACE FUNCTION public.guard_seller_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved','rejected')
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only an admin can change approval status';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Cannot transfer seller ownership';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER sellers_guard_status BEFORE UPDATE ON public.sellers
FOR EACH ROW EXECUTE FUNCTION public.guard_seller_status();

-- products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2),
  image_url text,
  reel_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_seller_idx ON public.products (seller_id);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view products of approved sellers" ON public.products FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.status = 'approved'));
CREATE POLICY "Sellers manage own products" ON public.products FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid()));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- seller_updates
CREATE TABLE public.seller_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  update_date date NOT NULL,
  status public.day_status NOT NULL,
  opening_time time,
  closing_time time,
  location_text text,
  maps_url text,
  announcement text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, update_date)
);
CREATE INDEX seller_updates_date_idx ON public.seller_updates (update_date);
GRANT SELECT ON public.seller_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_updates TO authenticated;
GRANT ALL ON public.seller_updates TO service_role;
ALTER TABLE public.seller_updates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER seller_updates_updated_at BEFORE UPDATE ON public.seller_updates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view updates of approved sellers" ON public.seller_updates FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.status = 'approved'));
CREATE POLICY "Sellers manage own updates" ON public.seller_updates FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = seller_id AND s.user_id = auth.uid()));
CREATE POLICY "Admins manage updates" ON public.seller_updates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage: owners write only inside their own folder; reads go through the server media route.
DROP POLICY IF EXISTS "Owners upload own media" ON storage.objects;
DROP POLICY IF EXISTS "Owners update own media" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Owners read own media" ON storage.objects;
CREATE POLICY "Owners upload own media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('seller-avatars','product-images') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners update own media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('seller-avatars','product-images') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete own media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('seller-avatars','product-images') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners read own media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('seller-avatars','product-images') AND (storage.foldername(name))[1] = auth.uid()::text);