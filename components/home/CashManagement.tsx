import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { CreditCardIcon, BanknotesIcon, BuildingLibraryIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { useTranslation } from '../../utils/i18n';
import Skeleton from '../ui/Skeleton';

interface CashItemProps {
  keyName: 'total_collected' | 'cash_available' | 'cash_deposit';
  title: string;
  value: string;
  IconComponent: any;
  onPress?: (keyName: 'total_collected' | 'cash_available' | 'cash_deposit') => void;
}

const CashItem = ({ keyName, title, value, IconComponent, onPress }: CashItemProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.itemContainer, pressed && styles.itemContainerPressed]}
      onPress={() => onPress?.(keyName)}
    >
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
    </Pressable>
  );
};

interface CashManagementProps {
  cashData?: {
    label: string;
    amount: number;
    subtitle: string;
  }[];
  loading?: boolean;
  onItemPress?: (keyName: 'total_collected' | 'cash_available' | 'cash_deposit') => void;
}

export default function CashManagement({ cashData, loading = false, onItemPress }: CashManagementProps) {
  const { t } = useTranslation();

  const getTranslatedCashLabel = (label: string) => {
    switch (label.trim().toLowerCase()) {
      case 'total collection':
      case 'total collected':
      case 'total cash collected':
        return t('total_collected');
      case 'cash available':
        return t('cash_available');
      case 'cash deposit':
      case 'cash deposited':
        return t('cash_deposit');
      default:
        return label;
    }
  };

  const getCashKey = (label: string): 'total_collected' | 'cash_available' | 'cash_deposit' => {
    switch (label.trim().toLowerCase()) {
      case 'total collection':
      case 'total collected':
      case 'total cash collected':
        return 'total_collected';
      case 'cash available':
        return 'cash_available';
      case 'cash deposit':
      case 'cash deposited':
        return 'cash_deposit';
      default:
        return 'cash_available';
    }
  };

  const getIconData = (label: string) => {
    switch (label.toLowerCase()) {
      case 'total collection':
      case 'total cash collected':
        return CreditCardIcon;
      case 'cash available':
        return BanknotesIcon;
      case 'cash deposit':
      case 'cash deposited':
        return BuildingLibraryIcon;
      default:
        return BanknotesIcon;
    }
  };

  const parsedCashData: CashItemProps[] =
    cashData && cashData.length > 0
      ? cashData.map((cashItem) => ({
          keyName: getCashKey(cashItem.label),
          title: getTranslatedCashLabel(cashItem.label),
          value: `\u20AC${cashItem.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          IconComponent: getIconData(cashItem.label),
        }))
      : [
          { keyName: 'total_collected' as const, title: t('total_collected'), value: '\u20AC0.00', IconComponent: CreditCardIcon },
          { keyName: 'cash_available' as const, title: t('cash_available'), value: '\u20AC0.00', IconComponent: BanknotesIcon },
          { keyName: 'cash_deposit' as const, title: t('cash_deposit'), value: '\u20AC0.00', IconComponent: BuildingLibraryIcon },
        ];

  const skeletonRows = [0, 1, 2];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('cash_management')}</Text>

      <View style={styles.cardContainer}>
        {loading
          ? skeletonRows.map((index) => (
              <View key={index}>
                <View style={styles.itemContainer}>
                  <View style={styles.itemLeft}>
                    <Skeleton width={scale(40)} height={scale(40)} borderRadius={scale(20)} />
                    <View style={styles.textContainer}>
                      <Skeleton width={scale(110)} height={moderateScale(16)} borderRadius={8} />
                      <Skeleton
                        width={scale(140)}
                        height={moderateScale(11)}
                        borderRadius={6}
                        style={styles.cashLabelSkeleton}
                      />
                    </View>
                  </View>
                  <Skeleton width={scale(14)} height={moderateScale(14)} borderRadius={7} />
                </View>
                {index < skeletonRows.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          : parsedCashData.map((item, index) => (
              <View key={item.title + index}>
                <CashItem {...item} onPress={onItemPress} />
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
    width: '100%',
    borderRadius: scale(12),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(10),
  },
  itemContainerPressed: {
    backgroundColor: '#F3E6DB',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  cashLabelSkeleton: {
    marginTop: verticalScale(6),
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(4),
  },
});
