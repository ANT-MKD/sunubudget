-- Date de confirmation e-mail (miroir de auth.users pour requêtes côté public / RLS)

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email_confirmed_at timestamptz;

COMMENT ON COLUMN public.user_profiles.email_confirmed_at IS
  'Date de confirmation e-mail (synchronisée depuis auth.users).';

-- Aligner les profils existants avec auth.users
UPDATE public.user_profiles p
SET email_confirmed_at = u.email_confirmed_at
FROM auth.users u
WHERE p.id = u.id
  AND (p.email_confirmed_at IS DISTINCT FROM u.email_confirmed_at);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, email_confirmed_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_email_confirmed_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at THEN
    UPDATE public.user_profiles
    SET email_confirmed_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email_confirmed_from_auth();
