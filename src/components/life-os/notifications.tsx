"use client";

import { useEffect } from "react";
import { useStats } from "@/lib/hooks";

export function NotificationManager() {
  const { data: stats } = useStats();

  useEffect(() => {
    // Request notification permission on first load
    if ("Notification" in window && Notification.permission === "default") {
      // Don't auto-request — wait for user action
    }
  }, []);

  useEffect(() => {
    if (!stats) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const overdue = stats.tasksOverdue || 0;
    const dueToday = stats.tasksToday || 0;
    const inbox = stats.inboxCount || 0;

    // Only notify once per session per condition
    const notified = sessionStorage.getItem("lifeos-notified");
    if (notified) return;

    if (overdue > 0) {
      new Notification("⚠️ Overdue tasks", {
        body: `You have ${overdue} overdue task${overdue > 1 ? "s" : ""}. Tap to review.`,
        icon: "/manifest.json",
        tag: "overdue",
      });
      sessionStorage.setItem("lifeos-notified", "1");
    } else if (dueToday > 0) {
      new Notification("📋 Tasks due today", {
        body: `You have ${dueToday} task${dueToday > 1 ? "s" : ""} due today.`,
        icon: "/manifest.json",
        tag: "due-today",
      });
      sessionStorage.setItem("lifeos-notified", "1");
    }
  }, [stats]);

  return null;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/manifest.json" });
  }
}
