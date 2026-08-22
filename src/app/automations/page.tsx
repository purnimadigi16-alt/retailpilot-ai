"use client";

import React, { useState } from "react";
import { useDemoSession } from "@/context/DemoSessionContext";
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  Truck,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function AutomationsPage() {
  const { organizationId } = useDemoSession();

  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const WORKFLOWS = [
    {
      id: "low_stock",
      title: "1. Low Stock Auto-Alert",
      trigger: "Webhook / POS Sale event",
      frequency: "Event-driven (<1s)",
      description: "Monitors stock dropping below reorder threshold, calculates sales velocity, and pushes urgent replenishment notifications.",
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "dead_stock",
      title: "2. Dead Stock Bi-Weekly Audit",
      trigger: "Cron: 0 0 */14 * *",
      frequency: "Bi-Weekly (Every 14 days)",
      description: "Identifies stagnant inventory with zero sales in 60+ days and compiles markdown liquidation promotion schedules.",
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      id: "supplier_escalation",
      title: "3. Supplier Payment Escalation",
      trigger: "Cron: 0 8 * * *",
      frequency: "Daily at 08:00 AM",
      description: "Scans open purchase orders due within 48 hours and alerts store managers and accounts to maintain credit terms.",
      icon: Truck,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "daily_sales",
      title: "4. Daily End-of-Day Sales Dossier",
      trigger: "Cron: 0 0 * * *",
      frequency: "Nightly at Midnight",
      description: "Aggregates day's gross revenue, customer returns, top revenue SKUs, and compiles an executive summary for the Owner.",
      icon: Zap,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "monthly_report",
      title: "5. Monthly Executive AI Report",
      trigger: "Cron: 0 0 1 * *",
      frequency: "1st of every month",
      description: "Executes the full Model Context Protocol data pipeline to synthesize executive financial P&L and strategic directives.",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  async function triggerWorkflow(workflowId: string) {
    setRunningWorkflow(workflowId);
    try {
      const res = await fetch("/api/cron/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: workflowId,
          organization_id: organizationId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Execution failed");

      setLogs((prev) => [
        {
          id: Date.now(),
          workflow: workflowId,
          timestamp: new Date().toLocaleTimeString(),
          result: json.result,
        },
        ...prev,
      ]);
    } catch (err: any) {
      alert(`Error triggering workflow: ${err.message}`);
    } finally {
      setRunningWorkflow(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h1 className="text-xl font-bold text-foreground">Mandatory Background Automations Engine</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automated event-driven webhooks & scheduled cron workflows driving operational reliability
          </p>
        </div>

        <button
          onClick={async () => {
            for (const w of WORKFLOWS) {
              await triggerWorkflow(w.id);
            }
          }}
          disabled={runningWorkflow !== null}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:opacity-50 transition"
        >
          <Play className="h-4 w-4" /> Trigger All 5 Workflows
        </button>
      </div>

      {/* 5 Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {WORKFLOWS.map((w) => {
          const Icon = w.icon;
          const isRunning = runningWorkflow === w.id;

          return (
            <div
              key={w.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${w.bgColor} ${w.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{w.frequency}</span>
                </div>

                <h3 className="font-bold text-sm text-foreground">{w.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{w.description}</p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">{w.trigger}</span>
                <button
                  onClick={() => triggerWorkflow(w.id)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-foreground hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Run Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Output Stream */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="font-bold text-sm text-foreground">Live Execution Audit Stream</h2>
          <span className="text-xs text-muted-foreground">{logs.length} runs recorded</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No workflows executed in current session. Click &quot;Run Now&quot; on any card above to simulate.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-border bg-background p-4 text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    [WORKFLOW_SUCCESS] {log.workflow}
                  </span>
                  <span className="text-muted-foreground">{log.timestamp}</span>
                </div>
                <pre className="text-[11px] text-foreground/80 overflow-x-auto bg-zinc-950 p-2.5 rounded-lg">
                  {JSON.stringify(log.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
