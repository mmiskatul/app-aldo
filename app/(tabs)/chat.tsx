import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import apiClient from "../../api/apiClient";
import ChatInput from "../../components/chat/ChatInput";
import ChatMessage from "../../components/chat/ChatMessage";
import QuickPrompts from "../../components/chat/QuickPrompts";
import Header from "../../components/ui/Header";
import { ChatRouteSkeleton } from "../../components/ui/RouteSkeletons";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../utils/i18n";

export default function ChatScreen() {
  const { t } = useTranslation();
  const tokens = useAppStore((state) => state.tokens);
  const chatMessagesCache = useAppStore((state) => state.chatMessagesCache);
  const setChatMessagesCache = useAppStore((state) => state.setChatMessagesCache);
  const [messages, setMessages] = useState<any[]>(chatMessagesCache);
  const [loading, setLoading] = useState(chatMessagesCache.length === 0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasFetchedRef = useRef(false);

  const scrollToBottom = () => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      200,
    );
  };

  useEffect(() => {
    if (!tokens?.access_token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      hasFetchedRef.current = false;
      return;
    }

    const apiUrl =
      apiClient.defaults.baseURL ||
      process.env.EXPO_PUBLIC_API_URL ||
      "https://risto-ai.vercel.app";
    let isMounted = true;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      apiClient
        .get("/api/v1/restaurant/chat/messages")
        .then((response) => {
          if (!isMounted) return;
          const nextMessages = response.data.messages || [];
          setMessages(nextMessages);
          setChatMessagesCache(nextMessages);
          setLoading(false);
          scrollToBottom();
        })
        .catch((error) => {
          console.error("Error fetching chat messages via REST:", error);
          if (!isMounted) return;
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    if (!socketRef.current) {
      socketRef.current = io(`${apiUrl}/restaurant-chat`, {
        path: "/socket.io",
        auth: { token: tokens.access_token },
        transports: ["websocket", "polling"],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        rememberUpgrade: true,
        timeout: 20000,
      });

      socketRef.current.on("connect", () => {
        console.log("Chat socket connected.");
      });

      socketRef.current.on("chat:conversation", (data: any) => {
        const nextMessages = data.messages || [];
        setIsAiTyping(false);
        setMessages(nextMessages);
        setChatMessagesCache(nextMessages);
        setLoading(false);
        scrollToBottom();
      });

      socketRef.current.on("connect_error", (error) => {
        const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";
        if (message.includes("timeout")) {
          console.log("Chat connection delayed, retrying socket connection.");
        } else {
          console.error("Chat connection error:", error);
        }
        setIsAiTyping(false);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Chat socket disconnected:", reason);
      });
    }

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [setChatMessagesCache, tokens?.access_token]);

  const handleSendMessage = async (text: string, file?: any) => {
    if (!text.trim() && !file) return;

    // Add locally to seem snappy while waiting for backend emit
    const optimisticMessage = {
      id: Date.now().toString(),
      role: "user",
      message: text.trim(),
      created_at: new Date().toISOString(),
      attachment_name: file?.name || null,
      attachment_source: file?.uri || null, // Best-effort local preview
    };
    let nextOptimisticMessages: any[] = [];
    setMessages((prev) => {
      nextOptimisticMessages = [...prev, optimisticMessage];
      return nextOptimisticMessages;
    });
    setChatMessagesCache(nextOptimisticMessages);
    scrollToBottom();

    if (file) {
      setIsAiTyping(true);
      // If a file is selected, upload via REST multipart/form-data
      try {
        const formData = new FormData();
        formData.append("message", text.trim());
        
        // Append the file properly for React Native FormData
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        } as any);

        const response = await apiClient.post("/api/v1/restaurant/chat/messages/attachments", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setIsAiTyping(false);
        // The API returns the updated messages array directly
        if (response.data && Array.isArray(response.data)) {
          setMessages(response.data);
          setChatMessagesCache(response.data);
          scrollToBottom();
        } else if (response.data?.messages) {
          setMessages(response.data.messages);
          setChatMessagesCache(response.data.messages);
          scrollToBottom();
        }
      } catch (error) {
        setIsAiTyping(false);
        console.error("Error uploading attachment:", error);
      }
    } else {
      // Prefer realtime when connected, but fall back to REST if the socket
      // transport is unavailable in the current deployment.
      setIsAiTyping(true);
      scrollToBottom();

      if (socketRef.current?.connected) {
        socketRef.current.emit("chat:message", {
          message: text.trim(),
          attachment_source: null,
        });
        return;
      }

      try {
        const response = await apiClient.post("/api/v1/restaurant/chat/messages", {
          message: text.trim(),
        });
        setIsAiTyping(false);
        setMessages(response.data.messages || []);
        setChatMessagesCache(response.data.messages || []);
        scrollToBottom();
      } catch (error) {
        setIsAiTyping(false);
        console.error("Error sending chat message:", error);
      }
    }
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        enabled={Platform.OS === "ios"}
      >
        <Header title={t('chat_title')} showBell={true} />

        {loading ? (
          <View style={styles.scrollView}>
            <ChatRouteSkeleton />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            <QuickPrompts />

            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                sender={msg.role === "assistant" ? "ai" : msg.role}
                message={msg.message}
                attachment_name={msg.attachment_name}
                attachment_source={msg.attachment_source}
              />
            ))}
            {isAiTyping && <ChatMessage sender="ai" isTyping={true} />}
          </ScrollView>
        )}

        <ChatInput onSend={handleSendMessage} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
