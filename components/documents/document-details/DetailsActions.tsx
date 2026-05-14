import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../../utils/i18n';

interface DetailsActionsProps {
  onDownload?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onUpdate?: () => void;
  isBusy?: boolean;
}

export default function DetailsActions({ 
  onDownload, 
  onDelete, 
  isEditing, 
  onEdit, 
  onCancel, 
  onUpdate,
  isBusy = false,
}: DetailsActionsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={isEditing ? onCancel : onEdit}
          disabled={isBusy}
        >
          <Feather 
            name={isEditing ? "x" : "edit-2"} 
            size={moderateScale(16)} 
            color="#4B5563" 
            style={{ marginRight: scale(8) }}
          />
          <Text style={styles.editButtonText}>{isEditing ? t('cancel') : t('edit_data')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.downloadButton} 
          onPress={isEditing ? onUpdate : onDownload}
          disabled={isBusy}
        >
          <Feather 
            name={isEditing ? "check" : "download"} 
            size={moderateScale(16)} 
            color="#FFFFFF" 
            style={{ marginRight: scale(8) }}
          />
          <Text style={styles.downloadText}>{isEditing ? t('update_data') : t('download')}</Text>
        </TouchableOpacity>
      </View>

      {!isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete} disabled={isBusy}>
          <Feather name="trash-2" size={moderateScale(16)} color="#EF4444" style={{ marginRight: scale(8) }}/>
          <Text style={styles.deleteText}>{t('delete')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: verticalScale(20),
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: scale(12),
    height: verticalScale(50),
    marginRight: scale(12),
  },
  editButtonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#4B5563',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    height: verticalScale(50),
  },
  downloadText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  deleteText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#EF4444',
  },
});
