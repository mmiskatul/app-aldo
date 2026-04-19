import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useAppStore } from "../../store/useAppStore";

export default function ChatScreen() {
  const tokens = useAppStore((state) => state.tokens);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!tokens?.access_token) return;

    const apiUrl =
      process.env.EXPO_PUBLIC_API_URL || "https://risto-ai.vercel.app";

    // First, fetch initial messages using the REST API
    apiClient
      .get("/api/v1/restaurant/chat/messages")
      .then((response) => {
        setMessages(response.data.messages || []);
        setLoading(false);
        setTimeout(
          () => scrollViewRef.current?.scrollToEnd({ animated: true }),
          200,
        );
      })
      .catch((error) => {
        console.error("Error fetching chat messages via REST:", error);
        setLoading(false);
      });

    // Then, initialize Socket.io connection for real-time interaction
    socketRef.current = io(`${apiUrl}/restaurant-chat`, {
      auth: { token: tokens.access_token },
      transports: ["polling"], // Force standard HTTP long-polling securely if websockets are completely unsupported by the deployment
    });

    socketRef.current.on("connect", () => {
      console.log("Chat socket connected.");
    });

    socketRef.current.on("chat:conversation", (data: any) => {
      setMessages(data.messages || []);
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        200,
      );
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Chat connection error:", error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [tokens]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !socketRef.current) return;

    // Add locally to seem snappy while waiting for backend emit
    const optimisticMessage = {
      id: Date.now().toString(),
      role: "user",
      message: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );

    // Send payload
    socketRef.current.emit("chat:message", {
      message: text.trim(),
      attachment_source: null,
    });
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        enabled={Platform.OS === "ios"}
      >
        <Header title="AI Chat" showBell={true} />

        {loading ? (
          <View
            style={[
              styles.scrollView,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <ActivityIndicator size="large" color="#FA8C4C" />
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
              />
            ))}
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
