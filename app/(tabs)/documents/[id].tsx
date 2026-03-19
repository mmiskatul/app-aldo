import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import Header from '../../../components/ui/Header';

import DocumentPreview from '../../../components/documents/document-details/DocumentPreview';
import DocumentInformation from '../../../components/documents/document-details/DocumentInformation';
import ExtractedData from '../../../components/documents/document-details/ExtractedData';
import DetailsActions from '../../../components/documents/document-details/DetailsActions';

// MOCK DATA GENERATOR (In a real app, you'd fetch this based on the ID)
const getMockDetails = (id: string | string[]) => {
  return {
    status: 'Processed',
    supplierName: 'Bakery Goods Co',
    totalAmount: '$425.00',
    invoiceDate: 'Oct 23, 2023',
    uploadDate: 'Oct 24, 2023',
    items: [
      { id: '1', name: 'Sourdough Loaf', qty: 20, unitPrice: '$5.00', totalPrice: '$100.00' },
      { id: '2', name: 'Pastry Flour (25kg)', qty: 5, unitPrice: '$45.00', totalPrice: '$225.00' },
      { id: '3', name: 'Butter (Case)', qty: 2, unitPrice: '$50.00', totalPrice: '$100.00' },
    ]
  };
};

export default function DocumentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const data = getMockDetails(id);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: { display: "none" },
      });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            display: "flex",
            position: "absolute",
            backgroundColor: "#FFF0E5",
            borderTopLeftRadius: scale(20),
            borderTopRightRadius: scale(20),
            height: verticalScale(60),
            paddingBottom: verticalScale(8),
            paddingTop: verticalScale(8),
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
        });
      };
    }, [navigation])
  );

  return (
    <View style={styles.safeArea}>
      <Header title="Document Details" showBack={true} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <DocumentPreview status={data.status} />
          
          <DocumentInformation 
            supplierName={data.supplierName}
            totalAmount={data.totalAmount}
            invoiceDate={data.invoiceDate}
            uploadDate={data.uploadDate}
          />
          
          <ExtractedData items={data.items} />
          
          <DetailsActions />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(40),
  },
});
