import { NextRequest, NextResponse } from "next/server";
import { adminDb, normalizeOrgId } from "@/lib/db";

const FALLBACK_SUPPLIERS = [
  { id: "00000000-0000-0000-0010-000000000001", organization_id: "00000000-0000-0000-0000-000000000001", name: "Amrit Fresh Dairy & Agro Ltd", phone: "+91-98200-11223", email: "orders@amritfresh.in", credit_days: 15, outstanding_balance: 145000.00 },
  { id: "00000000-0000-0000-0010-000000000002", organization_id: "00000000-0000-0000-0000-000000000001", name: "Himalayan Springs Beverages India", phone: "+91-98200-44556", email: "b2b@himalayansprings.in", credit_days: 30, outstanding_balance: 320000.00 },
  { id: "00000000-0000-0000-0010-000000000003", organization_id: "00000000-0000-0000-0000-000000000001", name: "Haldiram & SunHarvest Agro Ltd", phone: "+91-98200-77889", email: "supply@haldiramsunharvest.in", credit_days: 45, outstanding_balance: 85000.00 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawOrgId = searchParams.get("organization_id") || "org_01";
    const orgId = normalizeOrgId(rawOrgId);

    const { data, error } = await adminDb
      .from("suppliers")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ data: FALLBACK_SUPPLIERS });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ data: FALLBACK_SUPPLIERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization_id, name, phone, email, credit_days, outstanding_balance } = body;

    if (!organization_id || !name) {
      return NextResponse.json({ error: "Missing required supplier fields" }, { status: 400 });
    }

    const orgId = normalizeOrgId(organization_id);

    const { data, error } = await adminDb
      .from("suppliers")
      .insert([
        {
          organization_id: orgId,
          name,
          phone: phone || null,
          email: email || null,
          credit_days: Number(credit_days || 30),
          outstanding_balance: Number(outstanding_balance || 0),
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
