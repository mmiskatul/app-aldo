import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import FormInput from './FormInput';
import TypeModal from '../../ui/TypeModal';
import { useTranslation } from '../../../utils/i18n';

const RESTAURANT_TYPES = [
  'Pizzeria',
  'Fine Dining',
  'Fast Food',
  'Cafe',
  'Casual Dining',
  'Other',
];

interface RestaurantDetailsFormProps {
  restaurantName?: string;
  restaurantType?: string;
  cityLocation?: string;
  numberOfSeats?: string;
  onChangeRestaurantName?: (val: string) => void;
  onChangeRestaurantType?: (val: string) => void;
  onChangeCityLocation?: (val: string) => void;
  onChangeNumberOfSeats?: (val: string) => void;
}

export default function RestaurantDetailsForm({
  restaurantName,
  restaurantType,
  cityLocation,
  numberOfSeats,
  onChangeRestaurantName,
  onChangeRestaurantType,
  onChangeCityLocation,
  onChangeNumberOfSeats,
}: RestaurantDetailsFormProps) {
  const { t } = useTranslation();
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const restaurantTypeOptions = RESTAURANT_TYPES.map((value) => ({
    value,
    label: t(`restaurant_type_${value.toLowerCase().replace(/\s+/g, "_")}` as any),
  }));
  const selectedRestaurantTypeLabel =
    restaurantTypeOptions.find((option) => option.value === restaurantType)?.label || restaurantType;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('restaurant_details')}</Text>
      
      <FormInput 
        label={t('restaurant_name')} 
        value={restaurantName} 
        onChangeText={onChangeRestaurantName}
      />

      <View style={styles.dropdownWrapper}>
        <Text style={styles.dropdownLabel}>{t('restaurant_type')}</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowTypeDropdown(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownButtonText,
              !restaurantType ? styles.dropdownPlaceholder : null,
            ]}
          >
            {selectedRestaurantTypeLabel || t('select_option')}
          </Text>
          <Feather name="chevron-down" size={moderateScale(20)} color="#111827" />
        </TouchableOpacity>

        <TypeModal
          visible={showTypeDropdown}
          onClose={() => setShowTypeDropdown(false)}
          title={t('select_restaurant_type')}
          options={restaurantTypeOptions}
          selectedValue={restaurantType || ''}
          onSelect={(val) => onChangeRestaurantType?.(val)}
        />
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: scale(8) }}>
          <FormInput 
            label={t('city_location')} 
            value={cityLocation} 
            onChangeText={onChangeCityLocation}
          />
        </View>
        <View style={{ flex: 1, marginLeft: scale(8) }}>
          <FormInput 
            label={t('number_of_seats')} 
            value={numberOfSeats} 
            keyboardType="numeric" 
            onChangeText={onChangeNumberOfSeats}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
    letterSpacing: 1,
    marginBottom: verticalScale(20),
  },
  row: {
    flexDirection: 'row',
  },
  dropdownWrapper: {
    marginBottom: verticalScale(16),
  },
  dropdownLabel: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  dropdownButton: {
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownButtonText: {
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
});
