import { NextRequest, NextResponse } from "next/server";
import { runRetailPilotAssistant } from "@/agents/assistant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context = {}, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message string is required" },
        { status: 400 }
      );
    }

    const result = await runRetailPilotAssistant(message, context, history);
    return NextResponse.json({
      success: true,
      reply: result.reply,
      toolCallsExecuted: result.toolCallsExecuted,
      disclaimer: "⚠️ AI-generated recommendation — please verify all figures before commercial execution.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI Agent processing failed" },
      { status: 500 }
    );
  }
}
