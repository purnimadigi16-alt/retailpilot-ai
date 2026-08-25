import { NextRequest, NextResponse } from "next/server";
import { adminDb, normalizeOrgId } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = normalizeOrgId(searchParams.get("organization_id") || "org_01");

    const { data, error } = await adminDb
      .from("notifications")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, read = true, organization_id } = body;

    if (id) {
      await adminDb.from("notifications").update({ read }).eq("id", id);
    } else if (organization_id) {
      const orgId = normalizeOrgId(organization_id);
      await adminDb.from("notifications").update({ read: true }).eq("organization_id", orgId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
