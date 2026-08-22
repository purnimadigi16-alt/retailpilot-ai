import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";

    const { data, error } = await adminDb
      .from("customers")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization_id, name, phone, email, loyalty_points = 0 } = body;

    if (!organization_id || !name) {
      return NextResponse.json({ error: "Missing required customer name or org" }, { status: 400 });
    }

    const { data, error } = await adminDb
      .from("customers")
      .insert([
        {
          organization_id,
          name,
          phone: phone || null,
          email: email || null,
          loyalty_points: Number(loyalty_points || 0),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
