import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Linking } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BotIcon } from '@hugeicons/core-free-icons';
import { Feather } from '@expo/vector-icons';

type MarkdownNode = {
  type: string;
  value?: string;
  depth?: number;
  ordered?: boolean;
  checked?: boolean | null;
  url?: string;
  children?: MarkdownNode[];
};

interface ChatMessageProps {
  message?: string;
  sender: 'ai' | 'user';
  attachment_name?: string | null;
  attachment_source?: string | null;
  isTyping?: boolean;
  hideAvatar?: boolean;
}

function parseInlineMarkdown(text: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    if (match[2] && match[3]) {
      nodes.push({
        type: 'link',
        url: match[3],
        children: [{ type: 'text', value: match[2] }],
      });
    } else if (match[4]) {
      nodes.push({ type: 'inlineCode', value: match[4] });
    } else if (match[5] || match[6]) {
      nodes.push({
        type: 'strong',
        children: parseInlineMarkdown(match[5] || match[6] || ''),
      });
    } else if (match[7] || match[8]) {
      nodes.push({
        type: 'emphasis',
        children: parseInlineMarkdown(match[7] || match[8] || ''),
      });
    } else if (match[9]) {
      nodes.push({
        type: 'delete',
        children: parseInlineMarkdown(match[9]),
      });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return nodes;
}

function parseMarkdown(message: string): MarkdownNode {
  const lines = message.replace(/\r\n/g, '\n').split('\n');
  const children: MarkdownNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      children.push({ type: 'code', value: codeLines.join('\n') });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      children.push({
        type: 'heading',
        depth: headingMatch[1].length,
        children: parseInlineMarkdown(headingMatch[2]),
      });
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      children.push({ type: 'thematicBreak' });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }

      const quoteChildren = quoteLines
        .filter(Boolean)
        .map((quoteLine) => ({
          type: 'paragraph',
          children: parseInlineMarkdown(quoteLine),
        }));

      children.push({ type: 'blockquote', children: quoteChildren });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    const taskMatch = trimmed.match(/^[-*+]\s+\[(x|X| )\]\s+(.*)$/);
    if (taskMatch || unorderedMatch || orderedMatch) {
      const ordered = Boolean(orderedMatch);
      const items: MarkdownNode[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        const task = current.match(/^[-*+]\s+\[(x|X| )\]\s+(.*)$/);
        const unordered = current.match(/^[-*+]\s+(.*)$/);
        const orderedLine = current.match(/^(\d+)\.\s+(.*)$/);

        if (!task && !unordered && !orderedLine) {
          break;
        }

        const itemText = task?.[2] || orderedLine?.[2] || unordered?.[1] || '';
        items.push({
          type: 'listItem',
          checked: task ? task[1].toLowerCase() === 'x' : null,
          children: [{ type: 'paragraph', children: parseInlineMarkdown(itemText) }],
        });
        index += 1;
      }

      children.push({ type: 'list', ordered, children: items });
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;

    while (index < lines.length) {
      const nextTrimmed = lines[index].trim();
      if (
        !nextTrimmed ||
        /^```/.test(nextTrimmed) ||
        /^(#{1,3})\s+/.test(nextTrimmed) ||
        /^---+$/.test(nextTrimmed) ||
        /^\*\*\*+$/.test(nextTrimmed) ||
        nextTrimmed.startsWith('>') ||
        /^[-*+]\s+/.test(nextTrimmed) ||
        /^(\d+)\.\s+/.test(nextTrimmed)
      ) {
        break;
      }

      paragraphLines.push(nextTrimmed);
      index += 1;
    }

    children.push({
      type: 'paragraph',
      children: parseInlineMarkdown(paragraphLines.join(' ')),
    });
  }

  return { type: 'root', children };
}

export default function ChatMessage({ message, sender, attachment_name, attachment_source, isTyping, hideAvatar }: ChatMessageProps) {
  const isUser = sender === 'user';
  
  // Determine if we should show an image preview (local URI or remote valid URL)
  const isImageAttachment = attachment_name?.match(/\.(jpg|jpeg|png)$/i) || attachment_source?.match(/\.(jpg|jpeg|png)$/i);
  // Remove wrapping quotes from message
  const cleanMessage = message?.replace(/^"|"$/g, '');
  const markdownTree = !isUser && cleanMessage
    ? parseMarkdown(cleanMessage)
    : null;

  const renderInlineNodes = (nodes: MarkdownNode[] = [], textStyle: any, keyPrefix: string): React.ReactNode[] =>
    nodes.map((node, index) => {
      const key = `${keyPrefix}-${node.type}-${index}`;

      if (node.type === 'text') {
        return <Text key={key} style={textStyle}>{node.value || ''}</Text>;
      }

      if (node.type === 'inlineCode') {
        return (
          <Text key={key} style={[textStyle, styles.inlineCode, isUser ? styles.inlineCodeUser : styles.inlineCodeAi]}>
            {node.value || ''}
          </Text>
        );
      }

      if (node.type === 'strong') {
        return (
          <Text key={key} style={[textStyle, styles.strongText]}>
            {renderInlineNodes(node.children, [textStyle, styles.strongText], key)}
          </Text>
        );
      }

      if (node.type === 'emphasis') {
        return (
          <Text key={key} style={[textStyle, styles.emphasisText]}>
            {renderInlineNodes(node.children, [textStyle, styles.emphasisText], key)}
          </Text>
        );
      }

      if (node.type === 'delete') {
        return (
          <Text key={key} style={[textStyle, styles.deleteText]}>
            {renderInlineNodes(node.children, [textStyle, styles.deleteText], key)}
          </Text>
        );
      }

      if (node.type === 'link') {
        return (
          <Text
            key={key}
            style={[textStyle, styles.linkText, isUser ? styles.linkUser : styles.linkAi]}
            onPress={() => node.url && Linking.openURL(node.url)}
          >
            {renderInlineNodes(node.children, [textStyle, styles.linkText], key)}
          </Text>
        );
      }

      if (node.type === 'break') {
        return <Text key={key} style={textStyle}>{'\n'}</Text>;
      }

      return (
        <Text key={key} style={textStyle}>
          {renderInlineNodes(node.children, textStyle, key)}
        </Text>
      );
    });

  const renderBlockNodes = (nodes: MarkdownNode[] = [], keyPrefix: string): React.ReactNode[] =>
    nodes.map((node, index) => {
      const key = `${keyPrefix}-${node.type}-${index}`;

      if (node.type === 'paragraph') {
        return (
          <View key={key} style={styles.markdownBlock}>
            <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAi]}>
              {renderInlineNodes(node.children, [styles.messageText, isUser ? styles.textUser : styles.textAi], key)}
            </Text>
          </View>
        );
      }

      if (node.type === 'heading') {
        const headingStyle =
          node.depth === 1 ? styles.headingOne :
          node.depth === 2 ? styles.headingTwo :
          styles.headingThree;

        return (
          <View key={key} style={styles.markdownBlock}>
            <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAi, headingStyle]}>
              {renderInlineNodes(node.children, [styles.messageText, isUser ? styles.textUser : styles.textAi, headingStyle], key)}
            </Text>
          </View>
        );
      }

      if (node.type === 'list') {
        return (
          <View key={key} style={styles.markdownBlock}>
            {(node.children || []).map((item, itemIndex) => {
              const bullet =
                typeof item.checked === 'boolean'
                  ? item.checked ? '☑' : '☐'
                  : node.ordered
                    ? `${itemIndex + 1}.`
                    : '•';

              return (
                <View key={`${key}-item-${itemIndex}`} style={styles.listRow}>
                  <Text style={[styles.listBullet, isUser ? styles.textUser : styles.textAi]}>{bullet}</Text>
                  <View style={styles.listContent}>
                    {renderBlockNodes(item.children, `${key}-item-${itemIndex}`)}
                  </View>
                </View>
              );
            })}
          </View>
        );
      }

      if (node.type === 'code') {
        return (
          <View key={key} style={[styles.markdownBlock, styles.codeBlock, isUser ? styles.codeBlockUser : styles.codeBlockAi]}>
            <Text style={[styles.codeBlockText, isUser ? styles.textUser : styles.textAi]}>
              {node.value || ''}
            </Text>
          </View>
        );
      }

      if (node.type === 'blockquote') {
        return (
          <View key={key} style={[styles.markdownBlock, styles.blockquote, isUser ? styles.blockquoteUser : styles.blockquoteAi]}>
            {renderBlockNodes(node.children, key)}
          </View>
        );
      }

      if (node.type === 'table') {
        return (
          <View key={key} style={[styles.markdownBlock, styles.table]}>
            {(node.children || []).map((row, rowIndex) => (
              <View key={`${key}-row-${rowIndex}`} style={[styles.tableRow, rowIndex === 0 && styles.tableHeaderRow]}>
                {(row.children || []).map((cell, cellIndex) => (
                  <View key={`${key}-cell-${rowIndex}-${cellIndex}`} style={styles.tableCell}>
                    <Text style={[styles.tableCellText, isUser ? styles.textUser : styles.textAi, rowIndex === 0 && styles.tableHeaderText]}>
                      {renderInlineNodes(cell.children, [styles.tableCellText, isUser ? styles.textUser : styles.textAi, rowIndex === 0 && styles.tableHeaderText], `${key}-cell-${rowIndex}-${cellIndex}`)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      }

      if (node.type === 'thematicBreak') {
        return <View key={key} style={styles.horizontalRule} />;
      }

      return (
        <View key={key} style={styles.markdownBlock}>
          {renderBlockNodes(node.children, key)}
        </View>
      );
    });

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerAi, hideAvatar && { marginBottom: verticalScale(4) }]}>
      {!isUser && (
        <View style={[styles.aiAvatar, hideAvatar && { backgroundColor: 'transparent' }]}>
          {!hideAvatar && <HugeiconsIcon icon={BotIcon} size={moderateScale(16)} color="#FFFFFF" />}
        </View>
      )}
      
      <View style={styles.messageContent}>
        {!hideAvatar && (
          <Text style={[styles.senderName, isUser ? styles.nameUser : styles.nameAi]}>
            {isUser ? 'YOU' : 'RISTO AI'}
          </Text>
        )}
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
            isUser ? (
              <Text style={[styles.messageText, styles.textUser]}>
                {cleanMessage}
              </Text>
            ) : (
              <View>{renderBlockNodes(markdownTree?.children, "markdown")}</View>
            )
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
  markdownBlock: {
    marginBottom: verticalScale(8),
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
  strongText: {
    fontWeight: '700',
  },
  emphasisText: {
    fontStyle: 'italic',
  },
  deleteText: {
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    fontFamily: 'monospace',
    paddingHorizontal: scale(4),
    borderRadius: scale(4),
  },
  inlineCodeAi: {
    backgroundColor: '#E5E7EB',
  },
  inlineCodeUser: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  codeBlock: {
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  codeBlockAi: {
    backgroundColor: '#E5E7EB',
  },
  codeBlockUser: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  codeBlockText: {
    fontFamily: 'monospace',
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(19),
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: scale(10),
  },
  blockquoteAi: {
    borderLeftColor: '#D1D5DB',
  },
  blockquoteUser: {
    borderLeftColor: 'rgba(255,255,255,0.45)',
  },
  headingOne: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    lineHeight: moderateScale(28),
  },
  headingTwo: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    lineHeight: moderateScale(25),
  },
  headingThree: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    lineHeight: moderateScale(23),
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(6),
  },
  listBullet: {
    width: scale(18),
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(22),
  },
  listContent: {
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  tableHeaderRow: {
    backgroundColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(8),
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  tableCellText: {
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(18),
  },
  tableHeaderText: {
    fontWeight: '700',
  },
  horizontalRule: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: verticalScale(6),
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  linkAi: {
    color: '#2563EB',
  },
  linkUser: {
    color: '#FFFFFF',
  },
});
