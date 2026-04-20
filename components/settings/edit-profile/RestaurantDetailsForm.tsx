import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import FormInput from './FormInput';
import { useTranslation } from '../../../utils/i18n';

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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('restaurant_details')}</Text>
      
      <FormInput 
        label={t('restaurant_name')} 
        defaultValue={restaurantName} 
        onChangeText={onChangeRestaurantName}
      />

      <FormInput 
        label={t('restaurant_type')} 
        defaultValue={restaurantType} 
        onChangeText={onChangeRestaurantType}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: scale(8) }}>
          <FormInput 
            label={t('city_location')} 
            defaultValue={cityLocation} 
            onChangeText={onChangeCityLocation}
          />
        </View>
        <View style={{ flex: 1, marginLeft: scale(8) }}>
          <FormInput 
            label={t('number_of_seats')} 
            defaultValue={numberOfSeats} 
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
});
