import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { verticalScale } from "react-native-size-matters";
import { io, Socket } from "socket.io-client";
import apiClient from "../../api/apiClient";
import ChatInput from "../../components/chat/ChatInput/index";
import ChatMessage from "../../components/chat/ChatMessage";
import QuickPrompts from "../../components/chat/QuickPrompts";
import Header from "../../components/ui/Header";
import { ChatRouteSkeleton } from "../../components/ui/RouteSkeletons";
import { useCachedFocusRefresh } from "../../hooks/useCachedFocusRefresh";
import { useAppStore } from "../../store/useAppStore";
import { getApiBaseUrl } from "../../utils/api";
import { getApiDisplayMessage, logApiError, showApiError } from "../../utils/apiErrors";
import { isCacheFresh } from "../../utils/cache";
import { normalizeAppLanguage, useTranslation } from "../../utils/i18n";
import { resolveLocalizedText } from "../../utils/localizedContent";

const CHAT_REALTIME_ENV = process.env.EXPO_PUBLIC_CHAT_REALTIME?.trim().toLowerCase();
const CHAT_REALTIME_DISABLED_VALUES = new Set(["0", "false", "no", "off", "disabled"]);
const CHAT_REALTIME_ENABLED_VALUES = new Set(["1", "true", "yes", "on", "enabled"]);
const CHAT_CACHE_TTL_MS = 60 * 1000;

const getHostname = (url: string): string => {
  const match = url.trim().match(/^[a-z][a-z0-9+\-.]*:\/\/([^/:?#]+)/i);
  return (match?.[1] || "").toLowerCase();
};

const supportsRealtimeChat = (apiUrl: string): boolean => {
  if (CHAT_REALTIME_ENV && CHAT_REALTIME_DISABLED_VALUES.has(CHAT_REALTIME_ENV)) {
    return false;
  }

  if (CHAT_REALTIME_ENV && CHAT_REALTIME_ENABLED_VALUES.has(CHAT_REALTIME_ENV)) {
    return true;
  }

  const hostname = getHostname(apiUrl);
  return Boolean(hostname) && !hostname.endsWith(".vercel.app");
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const tokens = useAppStore((state) => state.tokens);
  const appLanguage = useAppStore((state) => state.appLanguage);
  const chatMessagesCache = useAppStore((state) => state.chatMessagesCache);
  const chatMessagesFetchedAt = useAppStore((state) => state.chatMessagesFetchedAt);
  const setChatMessagesCache = useAppStore((state) => state.setChatMessagesCache);
  const [messages, setMessages] = useState<any[]>(chatMessagesCache);
  const [loading, setLoading] = useState(chatMessagesCache.length === 0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasLoggedRealtimeFallbackRef = useRef(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const scrollToBottom = React.useCallback(() => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      200,
    );
  }, []);

  const fetchChatMessages = React.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      setErrorMessage(null);
      const response = await apiClient.get("/api/v1/restaurant/chat/messages");
      const nextMessages = response.data.messages || [];
      setMessages(nextMessages);
      setChatMessagesCache(nextMessages);
      scrollToBottom();
    } catch (error) {
      logApiError("chat.fetch", error);
      if (!silent || chatMessagesCache.length === 0) {
        setErrorMessage(getApiDisplayMessage(error, "Unable to load chat messages."));
      }
    } finally {
      setLoading(false);
    }
  }, [chatMessagesCache.length, scrollToBottom, setChatMessagesCache]);

  useCachedFocusRefresh({
    enabled: Boolean(tokens?.access_token),
    hasCache: chatMessagesCache.length > 0,
    fetchedAt: chatMessagesFetchedAt,
    ttlMs: CHAT_CACHE_TTL_MS,
    loadOnEmpty: () => {
      void fetchChatMessages(false);
    },
    refreshStale: () => {
      setMessages(chatMessagesCache);
      setLoading(false);
      void fetchChatMessages(true);
    },
  });

  useEffect(() => {
    if (!tokens?.access_token) {
      setLoading(false);
      return;
    }

    if (chatMessagesCache.length > 0) {
      setMessages(chatMessagesCache);
      setLoading(false);
      return;
    }

    if (!isCacheFresh(chatMessagesFetchedAt, CHAT_CACHE_TTL_MS)) {
      setLoading(true);
    }
  }, [chatMessagesCache, chatMessagesFetchedAt, tokens?.access_token]);

  useEffect(() => {
    if (!tokens?.access_token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const apiUrl = apiClient.defaults.baseURL || getApiBaseUrl();
    const realtimeEnabled = supportsRealtimeChat(apiUrl);

    if (!realtimeEnabled) {
      if (!hasLoggedRealtimeFallbackRef.current) {
        console.log("Chat realtime disabled for this API host; using REST fallback.");
        hasLoggedRealtimeFallbackRef.current = true;
      }
    } else if (!socketRef.current) {
      hasLoggedRealtimeFallbackRef.current = false;
      socketRef.current = io(`${apiUrl}/restaurant-chat`, {
        path: "/socket.io",
        auth: { token: tokens.access_token },
        transports: ["polling", "websocket"],
        tryAllTransports: true,
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        rememberUpgrade: false,
        timeout: 20000,
      });

      socketRef.current.on("connect", () => {
        console.log("Chat socket connected.");
        hasLoggedRealtimeFallbackRef.current = false;
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
        if (message.includes("websocket") || message.includes("xhr poll") || message.includes("timeout")) {
          if (!hasLoggedRealtimeFallbackRef.current) {
            console.log("Chat realtime unavailable, using REST fallback.");
            hasLoggedRealtimeFallbackRef.current = true;
          }
        } else {
          console.error("Chat connection error:", error);
        }
        setIsAiTyping(false);
      });

      socketRef.current.io.on("reconnect_failed", () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Chat socket disconnected:", reason);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [scrollToBottom, setChatMessagesCache, tokens?.access_token]);

  const handleSendMessage = async (text: string, file?: any) => {
    if (!text.trim() && !file) return;
    const chatLanguage = normalizeAppLanguage(appLanguage);

    // Add locally to seem snappy while waiting for backend emit
    const optimisticMessage = {
      id: Date.now().toString(),
      role: "user",
      message: text.trim(),
      message_translations: null,
      created_at: new Date().toISOString(),
      attachment_name: file?.name || null,
      attachment_source: file?.uri || null, // Best-effort local preview
      attachment_summary_translations: null,
    };
    let nextOptimisticMessages: any[] = [];
    setMessages((prev) => {
      nextOptimisticMessages = [...prev, optimisticMessage];
      return nextOptimisticMessages;
    });
    setChatMessagesCache(nextOptimisticMessages);
    setErrorMessage(null);
    scrollToBottom();

    if (file) {
      setIsAiTyping(true);
      // If a file is selected, upload via REST multipart/form-data
      try {
        const formData = new FormData();
        formData.append("message", text.trim());
        formData.append("language", chatLanguage);
        
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
        const revertedMessages = nextOptimisticMessages.filter((item) => item.id !== optimisticMessage.id);
        setMessages(revertedMessages);
        setChatMessagesCache(revertedMessages);
        showApiError("chat.upload_attachment", error, "Unable to upload attachment.", "Upload failed");
      }
    } else {
      // Prefer realtime when connected, but fall back to REST if the socket
      // transport is unavailable in the current deployment.
      setIsAiTyping(true);
      scrollToBottom();

      if (socketRef.current?.connected) {
        socketRef.current.emit("chat:message", {
          message: text.trim(),
          language: chatLanguage,
          attachment_source: null,
        });
        return;
      }

      try {
        // Use a long timeout (60 s) so Vercel serverless AI response is not cut off.
        const response = await apiClient.post(
          "/api/v1/restaurant/chat/messages",
          { message: text.trim(), language: chatLanguage },
          { timeout: 60_000 },
        );
        setIsAiTyping(false);
        setMessages(response.data.messages || []);
        setChatMessagesCache(response.data.messages || []);
        scrollToBottom();
      } catch (error: any) {
        // If timed-out / Vercel gateway cut the connection, poll for the AI reply.
        const isTimeout =
          error?.code === "ECONNABORTED" ||
          String(error?.message || "").toLowerCase().includes("timeout") ||
          error?.response?.status === 504 ||
          error?.response?.status === 524;

        if (isTimeout) {
          let recovered = false;
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            try {
              const pollRes = await apiClient.get("/api/v1/restaurant/chat/messages");
              const polledMessages: any[] = pollRes.data.messages || [];
              const hasAiReply = polledMessages.some(
                (m: any) =>
                  m.role === "assistant" &&
                  new Date(m.created_at).getTime() > Date.now() - 90_000,
              );
              if (hasAiReply) {
                setIsAiTyping(false);
                setMessages(polledMessages);
                setChatMessagesCache(polledMessages);
                scrollToBottom();
                recovered = true;
                break;
              }
            } catch {
              // ignore poll errors
            }
          }
          if (!recovered) {
            setIsAiTyping(false);
            showApiError("chat.send_message", error, "The AI is taking too long. Please try again.", "Send failed");
          }
        } else {
          setIsAiTyping(false);
          const revertedMessages = nextOptimisticMessages.filter((item) => item.id !== optimisticMessage.id);
          setMessages(revertedMessages);
          setChatMessagesCache(revertedMessages);
          showApiError("chat.send_message", error, "Unable to send message.", "Send failed");
        }
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
        <Header
          title={t('chat_title')}
          showBack={true}
          showBell={true}
        />

        {loading ? (
          <View style={styles.scrollView}>
            <ChatRouteSkeleton />
          </View>
        ) : errorMessage && messages.length === 0 ? (
          <View style={styles.errorContainer}>
            <ChatMessage sender="ai" message={errorMessage} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.length === 0 && (
              <QuickPrompts onSelectPrompt={(text) => handleSendMessage(text)} />
            )}

            {messages.map((msg, index) => {
              const currentSender = msg.role === "assistant" ? "ai" : msg.role;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const prevSender = prevMsg ? (prevMsg.role === "assistant" ? "ai" : prevMsg.role) : null;
              const hideAvatar = currentSender === prevSender;

              return (
                <ChatMessage
                  key={msg.id || index}
                  sender={currentSender}
                  message={resolveLocalizedText(appLanguage, msg.message_translations, msg.message)}
                  attachment_name={msg.attachment_name}
                  attachment_source={msg.attachment_source}
                  hideAvatar={hideAvatar}
                />
              );
            })}
            {isAiTyping && <ChatMessage sender="ai" isTyping={true} hideAvatar={messages.length > 0 && (messages[messages.length - 1].role === "assistant")} />}
          </ScrollView>
        )}

        <ChatInput onSend={handleSendMessage} />
        {!isKeyboardVisible && <View style={{ height: verticalScale(76) }} />}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
