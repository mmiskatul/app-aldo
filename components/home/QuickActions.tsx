import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { DocumentArrowUpIcon, PencilSquareIcon, ClipboardDocumentListIcon, CurrencyDollarIcon } from 'react-native-heroicons/outline';

interface ActionItemProps {
  title: string;
  IconComponent: any;
  onPress?: () => void;
}

const ActionItem = ({ title, IconComponent, onPress }: ActionItemProps) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View style={styles.iconContainer}>
        <IconComponent size={moderateScale(20)} color="#FA8C4C" />
      </View>
      <Text style={styles.itemTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function QuickActions() {
  const router = useRouter();
  
  const actions: ActionItemProps[] = [
    { 
      title: 'Upload Invoice', 
      IconComponent: DocumentArrowUpIcon,
      onPress: () => router.push('/(tabs)/home/upload-invoice'),
    },
    { 
      title: 'Data Management', 
      IconComponent: PencilSquareIcon,
      onPress: () => router.push('/(tabs)/home/data-management'),
    },
    { title: 'Expenses', IconComponent: ClipboardDocumentListIcon },
    { title: 'Cash', IconComponent: CurrencyDollarIcon },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.cardContainer}>
        {actions.map((item) => (
          <ActionItem key={item.title} {...item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: scale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemContainer: {
    alignItems: 'center',
    width: '24%', // roughly quarter width to fit 4 evenly
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#FFF0E5', // Matches faint orange
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: '#F9D8C4', // Slight darker border on these ones
  },
  itemTitle: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
