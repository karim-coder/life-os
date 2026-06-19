"use client";

import { useItems } from "@/lib/hooks";
import { useLifeOS } from "@/store/life-os";
import { Icon } from "./icon";
import { motion } from "framer-motion";
import { fmtDate, smartDate } from "@/lib/dates";

export function SubscriptionsOverview() {
  const { data } = useItems({ type: "finance", status: "active,done" });
  const { openItemDetail, openItemEditor } = useLifeOS();

  const items = data?.items || [];
  const subscriptions = items.filter((i: any) => i.metadata?.recurring && i.metadata?.recurring !== "one-time");
  const income = items.filter((i: any) => i.metadata?.kind === "income");
  const expenses = items.filter((i: any) => i.metadata?.kind === "expense" && (!i.metadata?.recurring || i.metadata?.recurring === "one-time"));
  const goals = items.filter((i: any) => i.metadata?.kind === "goal");

  const monthlySubTotal = subscriptions.reduce((s: number, s2: any) => s + (Number(s2.metadata?.amount) || 0), 0);
  const yearlySubTotal = monthlySubTotal * 12;
  const monthlyIncome = income.reduce((s: number, i: any) => s + (Number(i.metadata?.amount) || 0), 0);
  const monthlyExpenses = expenses.reduce((s: number, i: any) => s + (Number(i.metadata?.amount) || 0), 0);
  const net = monthlyIncome - monthlyExpenses - monthlySubTotal;

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
            <Icon name="Wallet" className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">Wealth overview</h3>
        </div>
        <p className="text-xs text-muted-foreground">Track income, expenses, subscriptions, and savings goals.</p>
        <button
          onClick={() => openItemEditor({ type: "finance" })}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
        >
          <Icon name="Plus" className="h-3 w-3" /> Add a transaction
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Monthly cashflow card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
            <Icon name="TrendingUp" className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Monthly cashflow</h3>
            <p className="text-[10px] text-muted-foreground">Income minus expenses & subscriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">Income</p>
            <p className="mt-0.5 text-base font-bold tabular-nums text-emerald-600">${monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-2.5 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-rose-500">Expenses</p>
            <p className="mt-0.5 text-base font-bold tabular-nums text-rose-500">${(monthlyExpenses + monthlySubTotal).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-muted p-2.5 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Net</p>
            <p className={`mt-0.5 text-base font-bold tabular-nums ${net >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              {net >= 0 ? "+" : "−"}${Math.abs(net).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions card */}
      {subscriptions.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                <Icon name="Repeat" className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Subscriptions</h3>
                <p className="text-[10px] text-muted-foreground">
                  ${monthlySubTotal.toFixed(2)}/mo · ${yearlySubTotal.toFixed(0)}/yr
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {subscriptions.slice(0, 5).map((s: any, i: number) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openItemDetail(s.id)}
                className="group flex w-full items-center gap-2 rounded-lg border border-border/40 bg-background/40 p-2 text-left transition-all hover:bg-background"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                  <Icon name="CreditCard" className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.metadata?.recurring} · next {smartDate(s.dueDate)}
                  </p>
                </div>
                <span className="text-xs font-bold tabular-nums text-rose-500">
                  ${Number(s.metadata?.amount).toFixed(2)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Savings goals */}
      {goals.length > 0 && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
              <Icon name="Target" className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold">Savings goals</h3>
          </div>
          <div className="space-y-2">
            {goals.map((g: any, i: number) => {
              const target = Number(g.metadata?.amount) || 0;
              const current = Number(g.metadata?.current) || 0;
              const pct = target > 0 ? Math.round((current / target) * 100) : 0;
              return (
                <motion.button
                  key={g.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openItemDetail(g.id)}
                  className="block w-full text-left"
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-muted-foreground">
                      ${current.toLocaleString()} / ${target.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[10px] font-medium text-blue-500">{pct}%</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
