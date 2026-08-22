"use client";

import React, { useState } from "react";
import { QA_50_TEST_CASES, TestCase } from "../../../tests/qa-matrix";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Play,
  Filter,
  ShieldCheck,
  Zap,
  Boxes,
  Code2,
  Smartphone,
  RefreshCw,
} from "lucide-react";

export default function QaMatrixPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; message: string; durationMs: number }>>({});
  const [runningAll, setRunningAll] = useState(false);
  const [runningSingle, setRunningSingle] = useState<string | null>(null);

  const categories = [
    { id: "ALL", name: "All 50 Test Cases", count: 50 },
    { id: "Functional Tests", name: "1. Functional Tests", count: 25, icon: Boxes },
    { id: "API & Contracts", name: "2. API & Contracts", count: 10, icon: Code2 },
    { id: "Security & Multi-Tenant RLS", name: "3. Security & Multi-Tenant RLS", count: 5, icon: ShieldCheck },
    { id: "AI Agents & MCP Calling", name: "4. AI Agents & MCP Calling", count: 5, icon: Zap },
    { id: "UI & Mobile POS", name: "5. UI & Mobile POS", count: 5, icon: Smartphone },
  ];

  async function runSingleTest(test: TestCase) {
    setRunningSingle(test.id);
    try {
      const res = await test.run();
      setTestResults((prev) => ({ ...prev, [test.id]: res }));
    } catch (e: any) {
      setTestResults((prev) => ({ ...prev, [test.id]: { passed: false, message: e.message, durationMs: 0 } }));
    } finally {
      setRunningSingle(null);
    }
  }

  async function runAllTests() {
    setRunningAll(true);
    for (const test of QA_50_TEST_CASES) {
      try {
        const res = await test.run();
        setTestResults((prev) => ({ ...prev, [test.id]: res }));
      } catch (e: any) {
        setTestResults((prev) => ({ ...prev, [test.id]: { passed: false, message: e.message, durationMs: 0 } }));
      }
    }
    setRunningAll(false);
  }

  const filteredTests = selectedCategory === "ALL"
    ? QA_50_TEST_CASES
    : QA_50_TEST_CASES.filter((t) => t.category === selectedCategory);

  const totalExecuted = Object.keys(testResults).length;
  const passedCount = Object.values(testResults).filter((r) => r.passed).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-foreground">Quality Assurance & 50 QA Test Cases Matrix</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete verification suite spanning Functional, API, Multi-Tenant RLS, MCP AI, and Mobile POS domains
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Verified Pass Rate</span>
            <span className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
              {totalExecuted > 0 ? `${passedCount} / ${totalExecuted} (${Math.round((passedCount / totalExecuted) * 100)}%)` : "50 Documented Cases"}
            </span>
          </div>

          <button
            onClick={runAllTests}
            disabled={runningAll}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 disabled:opacity-50 transition"
          >
            {runningAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running All 50 Tests...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Execute All 50 Test Cases</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
              selectedCategory === c.id
                ? "border-blue-600 bg-blue-600 text-white shadow"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      {/* Test Matrix Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-accent/40 text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">Test ID</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Test Title & Scope</th>
              <th className="p-3.5">Target Verification Criterion</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredTests.map((test) => {
              const res = testResults[test.id];
              const isRunning = runningSingle === test.id;

              return (
                <tr key={test.id} className="hover:bg-accent/30 transition">
                  <td className="p-3.5 font-mono font-bold text-foreground">{test.id}</td>
                  <td className="p-3.5 text-muted-foreground font-medium text-[11px] whitespace-nowrap">
                    {test.category}
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <p className="font-bold text-foreground">{test.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{test.scope}</p>
                  </td>
                  <td className="p-3.5 text-[11px] text-muted-foreground max-w-xs">
                    {test.expectedResult}
                  </td>
                  <td className="p-3.5 text-center">
                    {res ? (
                      res.passed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> PASS ({res.durationMs}ms)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2.5 py-0.5 text-[10px] font-bold">
                          <XCircle className="h-3 w-3" /> FAIL
                        </span>
                      )
                    ) : (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        Ready
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => runSingleTest(test)}
                      disabled={isRunning || runningAll}
                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
                    >
                      {isRunning ? "..." : "Run Test"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
