-- Profil à l'inscription + updated_at + pourcentage d'épargne

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_savings_goals_updated_at ON public.savings_goals;
CREATE TRIGGER trg_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.calculate_savings_percentage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  pct numeric;
BEGIN
  IF NEW.target_amount IS NULL OR NEW.target_amount <= 0 THEN
    NEW.percentage := 0;
  ELSE
    pct := ROUND((NEW.current_amount / NEW.target_amount) * 100, 2);
    IF pct > 100 THEN
      NEW.percentage := 100;
    ELSIF pct < 0 THEN
      NEW.percentage := 0;
    ELSE
      NEW.percentage := pct;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_savings_goals_percentage ON public.savings_goals;
CREATE TRIGGER trg_savings_goals_percentage
  BEFORE INSERT OR UPDATE OF current_amount, target_amount ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_savings_percentage();
