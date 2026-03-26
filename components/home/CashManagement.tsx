import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { CreditCardIcon, BanknotesIcon, BuildingLibraryIcon, ChevronRightIcon } from 'react-native-heroicons/outline';

interface CashItemProps {
  title: string;
  value: string;
  IconComponent: any;
}

const CashItem = ({ title, value, IconComponent }: CashItemProps) => {
  return (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <IconComponent size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemValue}>{value}</Text>
          <Text style={styles.itemTitle}>{title}</Text>
        </View>
      </View>
      <ChevronRightIcon size={moderateScale(16)} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

interface CashManagementProps {
  cashData?: {
    label: string;
    amount: number;
    subtitle: string;
  }[];
}

export default function CashManagement({ cashData }: CashManagementProps) {
  const getIconData = (label: string) => {
    switch (label.toLowerCase()) {
      case 'total cash collected': return CreditCardIcon;
      case 'cash available': return BanknotesIcon;
      case 'cash deposited': return BuildingLibraryIcon;
      default: return BanknotesIcon;
    }
  };

  const parsedCashData: CashItemProps[] = cashData && cashData.length > 0
    ? cashData.map(c => ({
        title: c.label,
        value: `€${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        IconComponent: getIconData(c.label),
      }))
    : [
        { title: 'Total Cash Collected', value: '€0.00', IconComponent: CreditCardIcon },
        { title: 'Cash Available', value: '€0.00', IconComponent: BanknotesIcon },
        { title: 'Cash Deposited to Bank', value: '€0.00', IconComponent: BuildingLibraryIcon },
      ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cash Management</Text>
      
      <View style={styles.cardContainer}>
        {parsedCashData.map((item, index) => (
          <View key={item.title + index}>
            <CashItem {...item} />
            {index < parsedCashData.length - 1 && <View style={styles.divider} />}
          </View>
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
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  textContainer: {
    justifyContent: 'center',
  },
  itemValue: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  itemTitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(4),
  },
});
