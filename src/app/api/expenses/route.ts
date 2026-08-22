import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organization_id") || "org_01";
    const storeId = searchParams.get("store_id");

    let query = adminDb
      .from("expenses")
      .select("*, stores ( name )")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;
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
    const { organization_id, store_id, category, amount, notes } = body;

    if (!organization_id || !store_id || !category || !amount) {
      return NextResponse.json({ error: "Missing required expense fields" }, { status: 400 });
    }

    const { data, error } = await adminDb
      .from("expenses")
      .insert([
        {
          organization_id,
          store_id,
          category,
          amount: Number(amount),
          notes: notes || null,
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
