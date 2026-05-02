import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ProfilePlaceholderAvatarProps {
  size: number;
  style?: ViewStyle;
}

export default function ProfilePlaceholderAvatar({
  size,
  style,
}: ProfilePlaceholderAvatarProps) {
  const headSize = size * 0.34;
  const bodyWidth = size * 0.82;
  const bodyHeight = size * 0.40;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.head,
          {
            width: headSize,
            height: headSize,
            borderRadius: headSize / 2,
            top: size * 0.15,
            left: (size - headSize) / 2 - size * 0.02,
          },
        ]}
      />
      <View
        style={[
          styles.body,
          {
            width: bodyWidth,
            height: bodyHeight,
            borderTopLeftRadius: bodyWidth / 2,
            borderTopRightRadius: bodyWidth / 2,
            left: (size - bodyWidth) / 2 - size * 0.02,
            bottom: -size * 0.02,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    position: 'relative',
  },
  head: {
    position: 'absolute',
    backgroundColor: '#B8BEC6',
  },
  body: {
    position: 'absolute',
    backgroundColor: '#B8BEC6',
  },
});
