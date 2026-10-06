"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { useUsers } from "@/hooks/useUsers";
import { useUsersStore } from "@/store/usersStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Loader2, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Audience = "all" | "selected";
type Severity = "info" | "success" | "warning" | "error";

export default function NotificationsPage() {
  const { fetchUsers } = useUsers();
  const { users, isLoading } = useUsersStore();
  const { sendClientNotification } = useNotifications();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("selected");
  const [severity, setSeverity] = useState<Severity>("info");
  const [link, setLink] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUsers();
    // The users hook returns a new function each render, so this page loads clients once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clients = useMemo(
    () => users.filter((user) => user.role !== "admin" && !user.isBlock),
    [users],
  );

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return clients;

    return clients.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email} ${user.phone || ""}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [clients, search]);

  const selectedClients = useMemo(
    () => clients.filter((user) => selectedIds.includes(user._id)),
    [clients, selectedIds],
  );

  const canSend = Boolean(title.trim() && message.trim() && (audience === "all" || selectedIds.length > 0));

  const toggleClient = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSend = async () => {
    if (!canSend || isSending) return;

    setIsSending(true);
    try {
      await sendClientNotification({
        title: title.trim(),
        message: message.trim(),
        audience,
        recipientIds: audience === "selected" ? selectedIds : [],
        severity,
        link: link.trim(),
      });
      setTitle("");
      setMessage("");
      setLink("");
      setSelectedIds([]);
      setSeverity("info");
      setAudience("selected");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Client Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Send app and push notifications for order updates, alerts, and client messages.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {audience === "all" ? `${clients.length} clients` : `${selectedIds.length} selected`}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Message</CardTitle>
                <CardDescription>Clients will see this in the app and receive a push alert when available.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Your order update is ready"
                maxLength={90}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a short, clear message for the client."
                className="min-h-32 resize-none"
                maxLength={420}
              />
              <p className="text-xs text-muted-foreground">{message.length}/420 characters</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(value) => setAudience(value as Audience)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="selected">Selected clients</SelectItem>
                    <SelectItem value="all">All clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={severity} onValueChange={(value) => setSeverity(value as Severity)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Action needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notification-link">Link</Label>
              <Input
                id="notification-link"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="/pages/orders/details"
              />
            </div>

            <Button className="w-full" disabled={!canSend || isSending} onClick={handleSend}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? "Sending..." : "Send notification"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              {audience === "all" ? "The notification will go to every active client." : "Choose who should receive it."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clients"
                className="pl-9"
                disabled={audience === "all"}
              />
            </div>

            {audience === "selected" ? (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <div className="text-sm">
                  <p className="font-medium">Selected clients</p>
                  <p className="text-muted-foreground">{selectedClients.length} of {clients.length}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(selectedIds.length === clients.length ? [] : clients.map((user) => user._id))}
                >
                  {selectedIds.length === clients.length ? "Clear" : "Select all"}
                </Button>
              </div>
            ) : null}

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading clients
                </div>
              ) : null}

              {!isLoading && audience === "all" ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                  All active clients will receive this notification.
                </div>
              ) : null}

              {!isLoading && audience === "selected" && filteredClients.map((user) => (
                <label
                  key={user._id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selectedIds.includes(user._id)}
                    onCheckedChange={() => toggleClient(user._id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email || user.phone}</p>
                  </div>
                </label>
              ))}

              {!isLoading && audience === "selected" && filteredClients.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No clients found.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
