"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api";

function relativeTime(dateValue) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchNotifications();
        if (!ignore) {
          setItems(response?.notifications || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load notifications");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const handleRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setItems((prev) => prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item)));
    } catch (err) {
      setError(err.message || "Unable to mark notification as read");
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(err.message || "Unable to mark all as read");
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto px-4 py-10">Loading notifications...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Unread: {unreadCount}</p>
        </div>
        <button onClick={handleReadAll} className="btn-outline" type="button">
          Mark all as read
        </button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className={`glass-card p-4 border ${item.isRead ? "border-border/70" : "border-primary/30"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{relativeTime(item.createdAt)}</p>
                </div>
                {!item.isRead ? (
                  <button
                    onClick={() => handleRead(item._id)}
                    className="btn-outline text-xs px-3 py-1.5"
                    type="button"
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-muted text-muted-foreground">
                    Read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
