"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  Cpu,
  Boxes,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Code2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{ name: string; args: any; result: any }>;
}

export default function AiAssistantPage() {
  const { organizationId, storeId, organizationName, name } = useDemoSession();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `### Welcome to RetailPilot AI Intelligence Studio\n\nI am your **Autonomous Business Assistant**, strictly grounded in your store's live Supabase database via the **Model Context Protocol (MCP)**.\n\nChoose an executive query below or ask any custom financial or inventory question:`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawInspectorData, setRawInspectorData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(queryText?: string) {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context: {
            organizationId,
            storeId,
            userName: name,
          },
          history: messages,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Agent query failed");

      const assistantMsg: Message = {
        role: "assistant",
        content: json.reply,
        toolCalls: json.toolCallsExecuted,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (json.toolCallsExecuted?.length > 0) {
        setRawInspectorData(json.toolCallsExecuted[0]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error communicating with AI Agent: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-foreground">AI Business Assistant & MCP Tool Studio</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Grounded in live database queries • Strict anti-hallucination MCP protocol • Dynamic tool calling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-300">
            <Cpu className="h-3.5 w-3.5" /> MCP Server: Online
          </span>
        </div>
      </div>

      {/* Main Grid: Chat Left (2 cols), MCP Raw Tool Inspector Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between h-[650px]">
          {/* Executive Query Shortcuts */}
          <div className="p-4 border-b border-border bg-accent/20 flex flex-wrap gap-2">
            <button
              onClick={() => handleSendMessage("Audit dead stock and compute markdown liquidation")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition"
            >
              <Boxes className="h-3 w-3 text-blue-500" /> Dead Stock Audit
            </button>
            <button
              onClick={() => handleSendMessage("Check low stock and replenishment urgency")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition"
            >
              <AlertTriangle className="h-3 w-3 text-amber-500" /> Low Stock Check
            </button>
            <button
              onClick={() => handleSendMessage("Show store P&L, COGS, and profit margins")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition"
            >
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Store P&L Margins
            </button>
            <button
              onClick={() => handleSendMessage("List supplier payables and upcoming payment dues")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition"
            >
              <Users className="h-3 w-3 text-purple-500" /> Supplier Payables
            </button>
            <button
              onClick={() => handleSendMessage("Generate complete monthly executive business report")}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent transition"
            >
              <FileText className="h-3 w-3 text-pink-500" /> Monthly Dossier
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 max-w-[85%] space-y-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-border bg-background/80 text-foreground"
                  }`}
                >
                  {/* Tool Call Tag */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="flex items-center gap-1.5 pb-2 border-b border-border/50 text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                      <Terminal className="h-3 w-3" />
                      <span>Invoked MCP Tool: <strong>{msg.toolCalls[0].name}()</strong></span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans prose dark:prose-invert prose-xs">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                <span>Invoking live MCP database query & synthesizing recommendations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about inventory runout, gross margins, dead stock, supplier aging..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-500 disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* MCP Live Tool Execution Inspector (Right Column) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-[650px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-500" />
              <h2 className="font-bold text-xs text-foreground uppercase tracking-wider">
                MCP Protocol Inspector
              </h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">JSON-RPC 2.0</span>
          </div>

          <div className="flex-1 my-3 overflow-y-auto rounded-xl bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 border border-border">
            {rawInspectorData ? (
              <div className="space-y-3">
                <div>
                  <span className="text-purple-400 font-bold"># Tool Name:</span>
                  <p className="text-zinc-100">{rawInspectorData.name}</p>
                </div>
                <div>
                  <span className="text-blue-400 font-bold"># Arguments:</span>
                  <pre className="text-[10px] text-zinc-300 overflow-x-auto mt-1">
                    {JSON.stringify(rawInspectorData.args, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold"># Live Database Payload:</span>
                  <pre className="text-[10px] text-zinc-300 overflow-x-auto mt-1">
                    {JSON.stringify(rawInspectorData.result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 text-xs">
                <Terminal className="h-8 w-8 mb-2 opacity-50" />
                <p>Run any query to inspect the live MCP tool arguments and Supabase payload.</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
            ⚠️ <strong>Anti-Hallucination Guardrail:</strong> Responses are strictly derived from live tool execution.
          </div>
        </div>
      </div>
    </div>
  );
}
