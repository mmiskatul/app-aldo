import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

interface DocumentPreviewProps {
  status: string;
  imageUrl?: string;
  token?: string;
}

export default function DocumentPreview({ status, imageUrl, token }: DocumentPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Preview</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.previewCard}>
        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
              headers: {
                Authorization: `Bearer ${token}`
              }
            }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.mockupDocument}>
            <Text style={styles.mockupText}>INVOICE</Text>
            <View style={styles.mockupLine} />
            <View style={styles.mockupLine} />
            <View style={[styles.mockupLine, { width: '60%' }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  statusDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#10B981',
    marginRight: scale(4),
  },
  statusText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '600',
    color: '#10B981',
  },
  previewCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: scale(16),
    padding: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mockupDocument: {
    width: '100%',
    aspectRatio: 1 / 1.3,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  mockupText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(20),
    letterSpacing: 1,
  },
  mockupLine: {
    height: verticalScale(4),
    backgroundColor: '#E5E7EB',
    borderRadius: scale(2),
    marginBottom: verticalScale(8),
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 1 / 0.85,
    borderRadius: scale(8),
  },
});
