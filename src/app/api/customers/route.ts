import { NextRequest, NextResponse } from "next/server";
import { adminDb, normalizeOrgId } from "@/lib/db";

const FALLBACK_CUSTOMERS = [
  { id: "00000000-0000-0000-0040-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", name: "Sneha Reddy", email: "sneha.reddy@gmail.com", phone: "+91-98765-43210", loyalty_points: 340 },
  { id: "00000000-0000-0000-0040-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", name: "Rohan Kulkarni", email: "rohan.kulkarni@yahoo.co.in", phone: "+91-98111-22334", loyalty_points: 180 },
  { id: "00000000-0000-0000-0040-000000000003", organization_id: "00000000-0000-0000-0000-000000000001", name: "Kavya Nair", email: "kavya.nair@outlook.com", phone: "+91-99444-55667", loyalty_points: 520 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawOrgId = searchParams.get("organization_id") || "org_01";
    const orgId = normalizeOrgId(rawOrgId);

    const { data, error } = await adminDb
      .from("customers")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ data: FALLBACK_CUSTOMERS });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ data: FALLBACK_CUSTOMERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization_id, name, phone, email, loyalty_points = 0 } = body;

    if (!organization_id || !name) {
      return NextResponse.json({ error: "Missing required customer name or org" }, { status: 400 });
    }

    const orgId = normalizeOrgId(organization_id);

    const { data, error } = await adminDb
      .from("customers")
      .insert([
        {
          organization_id: orgId,
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
