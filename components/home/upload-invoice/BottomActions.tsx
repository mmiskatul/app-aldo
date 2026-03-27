import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface BottomActionsProps {
  isEditing: boolean;
  isLoading?: boolean;
  onEditPress: () => void;
  onConfirmPress?: () => void;
}

export default function BottomActions({ isEditing, isLoading = false, onEditPress, onConfirmPress }: BottomActionsProps) {
  return (
    <View style={styles.bottomActions}>
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={onEditPress}
        disabled={isLoading}
      >
        <Text style={styles.editButtonText}>{isEditing ? "Finish Editing" : "Edit Data"}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={onConfirmPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.confirmButtonText}>Confirm & Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  editButtonText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#374151',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
