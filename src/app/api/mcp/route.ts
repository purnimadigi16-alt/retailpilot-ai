import { NextRequest, NextResponse } from "next/server";
import { handleMcpRpcRequest, executeMcpTool, MCP_TOOLS_DEFINITIONS } from "@/mcp/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    protocol: "Model Context Protocol (MCP) v1.0",
    tools: MCP_TOOLS_DEFINITIONS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a JSON-RPC request (has "jsonrpc" or "method")
    if (body.jsonrpc || body.method) {
      const response = await handleMcpRpcRequest(body);
      return NextResponse.json(response);
    }

    // Direct tool call format: { tool: string, args: Record<string, any> }
    const { tool, args = {} } = body;
    if (!tool) {
      return NextResponse.json(
        { error: "Missing 'tool' or 'method' in request payload" },
        { status: 400 }
      );
    }

    const data = await executeMcpTool(tool, args);
    return NextResponse.json({
      success: true,
      tool,
      result: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "MCP execution error" },
      { status: 500 }
    );
  }
}
