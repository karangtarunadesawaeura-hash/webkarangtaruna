import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export interface SessionUser {
  id: string;
  email: string | undefined;
  role: UserRole | null;
  full_name: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: (profile?.role as UserRole | undefined) ?? null,
      full_name: (profile?.full_name as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Wajibkan login + peran tertentu. Dipakai di layout/page admin (server). */
export async function requireRole(allowed: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!user.role || !allowed.includes(user.role)) redirect("/admin/login?error=forbidden");
  return user;
}

export function canPublish(role: UserRole | null | undefined): boolean {
  return role === "super_admin" || role === "admin";
}

export function canManageSettings(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

export function canManageMembers(role: UserRole | null | undefined): boolean {
  return role === "super_admin" || role === "admin";
}
