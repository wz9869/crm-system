import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    const { createServerClient } = await import("@supabase/ssr");
    let response = NextResponse.next({ request: req });
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) req.cookies.set(name, value);
          response = NextResponse.next({ request: req });
          for (const { name, value, options } of cookiesToSet)
            response.cookies.set(name, value, options);
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const targetId = (body.id ?? "").trim();
    if (!targetId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (targetId === user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await admin.auth.admin.deleteUser(targetId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Account deleted" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
