import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../utils/i18n';

export interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}

export default function PhotoPickerModal({ visible, onClose, onSelectCamera, onSelectGallery }: PhotoPickerModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('choose_profile_photo')}</Text>
              
              <View style={styles.modalOptions}>
                <TouchableOpacity 
                  style={styles.modalOption} 
                  onPress={() => {
                    onSelectCamera();
                    onClose();
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#F0F9FF' }]}>
                    <Feather name="camera" size={moderateScale(24)} color="#0EA5E9" />
                  </View>
                  <Text style={styles.modalOptionText}>{t('camera')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalOption} 
                  onPress={() => {
                    onSelectGallery();
                    onClose();
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#FFF7ED' }]}>
                    <Feather name="image" size={moderateScale(24)} color="#FA8C4C" />
                  </View>
                  <Text style={styles.modalOptionText}>{t('gallery')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    padding: scale(24),
    paddingBottom: verticalScale(40),
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(24),
    textAlign: 'center',
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(32),
  },
  modalOption: {
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  modalOptionText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '600',
    color: '#374151',
  },
});
