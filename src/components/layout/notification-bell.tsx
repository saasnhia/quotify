"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  UserPlus,
  PenLine,
  CreditCard,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Notification, NotificationType } from "@/types";

const POLL_INTERVAL = 30_000; // 30 seconds

function typeIcon(type: NotificationType) {
  switch (type) {
    case "lead":
      return <UserPlus className="h-4 w-4 text-emerald-500 shrink-0" />;
    case "signature":
      return <PenLine className="h-4 w-4 text-indigo-500 shrink-0" />;
    case "payment":
      return <CreditCard className="h-4 w-4 text-green-600 shrink-0" />;
    case "reminder":
      return <Bell className="h-4 w-4 text-amber-500 shrink-0" />;
    case "system":
      return <Info className="h-4 w-4 text-slate-500 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-slate-500 shrink-0" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "il y a quelques sec";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `il y a ${m} min`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `il y a ${h}h`;
  }
  if (diff < 172800) return "hier";
  const d = Math.floor(diff / 86400);
  return `il y a ${d}j`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json() as { notifications: Notification[] };
      setNotifications(json.notifications ?? []);
    } catch {
      // Silently ignore network errors during polling
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // When popover opens, mark all unread as read
  async function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      const unreadIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        try {
          await fetch("/api/notifications/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: unreadIds }),
          });
          setNotifications((prev) =>
            prev.map((n) =>
              unreadIds.includes(n.id) ? { ...n, read: true } : n
            )
          );
        } catch {
          // Non-blocking, ignore errors
        }
      }
    }
  }

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Non-blocking
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const inner = (
                <div
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                    !notif.read
                      ? "border-l-2 border-indigo-500 bg-indigo-50/50"
                      : "bg-white border-l-2 border-transparent"
                  }`}
                >
                  <div className="mt-0.5">{typeIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className="text-xs text-slate-500 truncate">
                        {notif.message}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-400">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                </div>
              );

              return notif.link ? (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  {inner}
                </Link>
              ) : (
                <div key={notif.id}>{inner}</div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
