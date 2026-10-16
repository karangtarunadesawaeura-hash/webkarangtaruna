-- Migrasi 0003: kunci eskalasi peran di profiles (defense in depth)
-- Spec: Hanya Super Admin. Akun baru via provisioning. Peran diverifikasi server & database.
-- Masalah yang ditutup: policy profiles_update_own mengizinkan user update barisnya sendiri,
-- termasuk kolom role, sehingga editor bisa mengangkat dirinya menjadi super_admin via API langsung.
-- Perbaikan: trigger BEFORE UPDATE yang menolak perubahan role kecuali oleh super_admin / service_role.

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_role text;
begin
  -- Tidak ada perubahan peran → lolos.
  if new.role is not distinct from old.role then
    return new;
  end if;

  -- Service role / postgres (auth.uid() null, mis. provisioning) → lolos.
  -- auth.role() = 'service_role' untuk service_role key; auth.uid() null untuk operasi sistem.
  if auth.role() = 'service_role' or auth.uid() is null then
    return new;
  end if;

  -- Cek peran pemanggil via helper yang sudah ada.
  select public.user_role() into caller_role;
  if caller_role = 'super_admin' then
    return new;
  end if;

  raise exception 'Hanya super_admin yang dapat mengubah peran pengguna.';
end;
$$;

drop trigger if exists trg_profiles_role_guard on public.profiles;
create trigger trg_profiles_role_guard
  before update of role on public.profiles
  for each row execute function public.prevent_role_escalation();
