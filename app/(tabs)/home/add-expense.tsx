import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import DatePicker from "../../../components/ui/DatePicker";

export default function AddExpenseScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date("2026-03-12T00:00:00"));

  return (
    <View style={styles.safeArea}>
      <Header title="Add Expenses" showBack={true} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expense Category</Text>
            <TouchableOpacity style={styles.dropdownInput}>
              <Text style={styles.dropdownPlaceholder}>Select a category</Text>
              <Feather name="chevron-down" size={moderateScale(20)} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.newCategoryPill}>
              <Feather name="plus" size={moderateScale(12)} color="#FA8C4C" style={{ marginRight: scale(4) }} />
              <Text style={styles.newCategoryText}>Create New Category</Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.textInputContainer}>
              <Text style={styles.prefix}>€ </Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="0.00" 
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Date */}
          <DatePicker 
            label="Date"
            value={date}
            onChange={setDate}
          />

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="Add details about this expense..." 
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.bottomFooter}>
          <TouchableOpacity style={styles.saveButton}>
            <Feather name="save" size={moderateScale(18)} color="#FFFFFF" style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>Save Expense</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(100),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
    marginBottom: verticalScale(12),
  },
  dropdownPlaceholder: {
    fontSize: moderateScale(15, 0.3),
    color: '#374151',
  },
  newCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCE7D6',
    backgroundColor: '#FFF8F3',
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  newCategoryText: {
    color: '#FA8C4C',
    fontSize: moderateScale(12, 0.3),
    fontWeight: '600',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
  },
  prefix: {
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(120),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    backgroundColor: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
  },
  bottomFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    justifyContent: "center",
    alignItems: "center",
  },
  saveIcon: {
    marginRight: scale(8),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
  },
});
