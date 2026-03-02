import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import Layout from "@/components/Layout";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<{ userId: string; profile: Profile | null; lastMessage: Message }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(searchParams.get("to"));
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          if (selectedUser && (msg.sender_id === selectedUser || msg.receiver_id === selectedUser)) {
            setMessages((prev) => [...prev, msg]);
          }
          fetchConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: allMessages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    
    if (!allMessages) return;

    const convMap = new Map<string, Message>();
    allMessages.forEach((m) => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, m);
    });

    const userIds = Array.from(convMap.keys());
    if (userIds.length === 0) {
      // If we have a "to" param but no conversations, still load that user
      if (selectedUser) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", selectedUser).maybeSingle();
        setSelectedProfile(profile);
      }
      setConversations([]);
      return;
    }

    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

    setConversations(userIds.map((uid) => ({
      userId: uid,
      profile: profileMap.get(uid) || null,
      lastMessage: convMap.get(uid)!,
    })));

    if (selectedUser) {
      setSelectedProfile(profileMap.get(selectedUser) || null);
    }
  };

  const loadMessages = async (userId: string) => {
    if (!user) return;
    setSelectedUser(userId);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    // Mark as read
    await supabase.from("messages").update({ is_read: true }).eq("receiver_id", user.id).eq("sender_id", userId).eq("is_read", false);

    // Get profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    setSelectedProfile(profile);
  };

  const sendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  if (!user) return <Layout><div className="container mx-auto px-4 py-12 text-center">{t("auth.loginRequired")}</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">{t("messages.title")}</h1>
        <div className="flex bg-card border border-border rounded-xl overflow-hidden" style={{ height: "calc(100vh - 300px)", minHeight: 400 }}>
          {/* Conversations list */}
          <div className="w-80 border-r border-border overflow-y-auto hidden md:block">
            {conversations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">{t("messages.noConversations")}</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => loadMessages(c.userId)}
                  className={`w-full p-4 text-left border-b border-border hover:bg-secondary transition-colors ${selectedUser === c.userId ? "bg-secondary" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm text-foreground truncate">{c.profile?.full_name || c.profile?.company_name || t("messages.unknown")}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage.content}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b border-border bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-heading font-semibold text-foreground">{selectedProfile?.full_name || selectedProfile?.company_name || t("messages.unknown")}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        m.sender_id === user.id
                          ? "bg-accent text-accent-foreground rounded-br-sm"
                          : "bg-secondary text-secondary-foreground rounded-bl-sm"
                      }`}>
                        {m.content}
                        <div className={`text-[10px] mt-1 ${m.sender_id === user.id ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("messages.typePlaceholder")}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      maxLength={2000}
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-accent hover:bg-orange-hover text-accent-foreground rounded-full px-4">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">{t("messages.selectConversation")}</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
