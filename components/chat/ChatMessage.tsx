import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BotIcon } from '@hugeicons/core-free-icons';
import { Feather } from '@expo/vector-icons';

interface ChatMessageProps {
  message?: string;
  sender: 'ai' | 'user';
  attachment_name?: string | null;
  attachment_source?: string | null;
  isTyping?: boolean;
}

export default function ChatMessage({ message, sender, attachment_name, attachment_source, isTyping }: ChatMessageProps) {
  const isUser = sender === 'user';
  
  // Determine if we should show an image preview (local URI or remote valid URL)
  const isImageAttachment = attachment_name?.match(/\.(jpg|jpeg|png)$/i) || attachment_source?.match(/\.(jpg|jpeg|png)$/i);
  // Remove wrapping quotes from message
  const cleanMessage = message?.replace(/^"|"$/g, '');

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerAi]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <HugeiconsIcon icon={BotIcon} size={moderateScale(16)} color="#FFFFFF" />
        </View>
      )}
      
      <View style={styles.messageContent}>
        <Text style={[styles.senderName, isUser ? styles.nameUser : styles.nameAi]}>
          {isUser ? 'YOU' : 'RISTO AI'}
        </Text>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          {(attachment_source || attachment_name) && (
            <View style={styles.attachmentWrapper}>
              {isImageAttachment && attachment_source ? (
                <Image 
                  source={{ uri: attachment_source }} 
                  style={styles.attachmentImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.attachmentFileBadge}>
                  <Feather name="file" size={moderateScale(14)} color={isUser ? "#FFFFFF" : "#FA8C4C"} />
                  <Text style={[styles.attachmentFileName, isUser ? styles.textUser : styles.textAi]} numberOfLines={1}>
                    {attachment_name || "Attached File"}
                  </Text>
                </View>
              )}
            </View>
          )}

          {isTyping ? (
            <ActivityIndicator size="small" color="#FA8C4C" />
          ) : cleanMessage ? (
            <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAi]}>
              {cleanMessage}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: verticalScale(24),
    paddingHorizontal: scale(20),
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  containerAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#FA8C4C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    marginTop: verticalScale(20), // Align with the bubble
  },
  messageContent: {
    maxWidth: '80%',
  },
  senderName: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: verticalScale(6),
  },
  nameAi: {
    color: '#9CA3AF',
    marginLeft: scale(4),
  },
  nameUser: {
    color: '#FA8C4C',
    textAlign: 'right',
    marginRight: scale(4),
  },
  bubble: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  bubbleAi: {
    backgroundColor: '#F3F4F6',
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(16),
    borderBottomLeftRadius: scale(16),
    borderTopLeftRadius: scale(4),
  },
  bubbleUser: {
    backgroundColor: '#FA8C4C',
    borderTopLeftRadius: scale(16),
    borderBottomLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
    borderBottomRightRadius: scale(4),
  },
  messageText: {
    fontSize: moderateScale(15, 0.3),
    lineHeight: moderateScale(22),
  },
  textAi: {
    color: '#1F2937',
  },
  textUser: {
    color: '#FFFFFF',
  },
  attachmentWrapper: {
    marginBottom: verticalScale(6),
  },
  attachmentImage: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: scale(8),
    marginBottom: verticalScale(4),
  },
  attachmentFileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    borderRadius: scale(6),
  },
  attachmentFileName: {
    fontSize: moderateScale(12, 0.3),
    marginLeft: scale(6),
    fontWeight: '500',
    maxWidth: scale(140),
  },
});
