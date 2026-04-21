import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import Header from "../../../components/ui/Header";
import { createSupportTicket } from "../../../api/support";

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const THEME_ORANGE = "#FA8B4F"; // Matching the vibrant orange from the button
  const ATTACH_COLOR = "#C25D11"; // A brownish-orange for the attach file text

  const handleSubmit = async () => {
    if (!issue.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        subject: issue.trim(),
        message: description.trim(),
      };

      if (attachedFile) {
        payload.attachment_name = attachedFile.name;
        payload.attachment_url = attachedFile.uri;
      }

      const res = await createSupportTicket(payload);
      console.log('[HelpCenter] Create ticket response:', JSON.stringify(res, null, 2));
      Alert.alert(
        "Ticket Created",
        `${res.message}\nTicket #${res.ticket.ticket_number}`
      );
      setIssue("");
      setDescription("");
      setAttachedFile(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachedFile(result.assets[0]);
      }
    } catch (err) {
      console.log("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Help Center" showBack={true} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: verticalScale(40) + insets.bottom,
              minHeight: "100%",
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topContent}>
            <View style={styles.titleRow}>
              {/* Titles */}
              <View>
                <Text style={styles.mainTitle}>Help Center</Text>
                <Text style={styles.subTitle}>How can we help you?</Text>
              </View>
              <TouchableOpacity
                style={styles.viewTicketsButton}
                activeOpacity={0.7}
              >
                <Text style={styles.viewTicketsText}>View All Tickets</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {/* Issue Selection Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Issue</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Issue name"
                    placeholderTextColor="#4B5563"
                    value={issue}
                    onChangeText={setIssue}
                  />
                </View>
              </View>

              {/* Description Input */}
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.label}>Describe Your Problem</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Explain your issue in detail..."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.attachWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.attachContainer}
                    onPress={handlePickDocument}
                  >
                    <Feather
                      name="paperclip"
                      size={moderateScale(16)}
                      color={ATTACH_COLOR}
                    />
                    <Text
                      style={[
                        styles.attachText,
                        {
                          color: ATTACH_COLOR,
                          flexShrink: 1,
                          marginRight: scale(8),
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {attachedFile
                        ? attachedFile.name
                        : "Attach File (optional)"}
                    </Text>
                  </TouchableOpacity>
                  {attachedFile && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.removeFileBtn}
                      onPress={() => setAttachedFile(null)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather
                        name="x"
                        size={moderateScale(18)}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.bottomContent}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: THEME_ORANGE, opacity: isLoading ? 0.7 : 1 },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Sending..." : "Send Message"}
              </Text>
              {!isLoading && (
                <Feather
                  name="send"
                  size={moderateScale(18)}
                  color="#FFFFFF"
                  style={{ marginLeft: scale(8) }}
                />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    padding: scale(20),
    justifyContent: "space-between",
  },
  topContent: {
    flex: 1,
  },
  bottomContent: {
    marginTop: verticalScale(40),
    paddingBottom: verticalScale(20),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: verticalScale(16),
  },
  viewTicketsButton: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    marginTop: verticalScale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  viewTicketsText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "600",
    color: "#374151",
  },
  mainTitle: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  subTitle: {
    fontSize: moderateScale(16, 0.3),
    color: "#6B7280",
    marginTop: verticalScale(4),
    marginBottom: verticalScale(32),
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: verticalScale(24),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "500",
    color: "#374151",
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(14),
    minHeight: verticalScale(50),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
  },
  textAreaWrapper: {
    height: verticalScale(160),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(14),
    alignItems: "flex-start",
  },
  textArea: {
    flex: 1,
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
    textAlignVertical: "top",
    height: "100%",
    width: "100%",
  },
  attachWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: scale(4),
  },
  attachContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(12),
    marginLeft: scale(4),
    flex: 1,
  },
  attachText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    marginLeft: scale(8),
  },
  removeFileBtn: {
    marginTop: verticalScale(12),
    padding: scale(4),
  },
  submitButton: {
    flexDirection: "row",
    borderRadius: scale(12),
    height: verticalScale(54),
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
