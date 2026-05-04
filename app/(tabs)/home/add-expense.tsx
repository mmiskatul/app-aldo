import { Feather } from "@expo/vector-icons";
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
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import DatePicker from "../../../components/ui/DatePicker";
import apiClient from "../../../api/apiClient";
import { formatApiDate } from "../../../utils/date";

export default function AddExpenseScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Category State
  const [categories, setCategories] = useState(["Food", "Utilities", "Rent", "Supplies", "Marketing", "Others"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryListVisible, setIsCategoryListVisible] = useState(false);
  
  // New Category State
  const [isNewCategoryModalVisible, setIsNewCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const trimmedName = newCategoryName.trim();
      if (!categories.includes(trimmedName)) {
        setCategories([...categories, trimmedName]);
      }
      setSelectedCategory(trimmedName);
      setNewCategoryName("");
      setIsNewCategoryModalVisible(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    setCategories(categories.filter(cat => cat !== categoryToDelete));
    if (selectedCategory === categoryToDelete) {
      setSelectedCategory("");
    }
  };

  const handleSave = async () => {
    if (!selectedCategory || !amount) return;

    try {
      setLoading(true);
      const response = await apiClient.post("/api/v1/restaurant/expenses", {
        category: selectedCategory.toLowerCase(),
        amount: parseFloat(amount) || 0,
        expense_date: formatApiDate(date),
        notes: notes
      });

      console.log("Expense API Response:", response.data);

      // Navigate back on success (as requested: no alert)
      router.back();
    } catch (error: any) {
      console.error("Error saving expense:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

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
            <TouchableOpacity 
              style={styles.dropdownInput}
              onPress={() => setIsCategoryListVisible(true)}
            >
              <Text style={selectedCategory ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedCategory || "Select a category"}
              </Text>
              <Feather name="chevron-down" size={moderateScale(20)} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.newCategoryPill}
              onPress={() => setIsNewCategoryModalVisible(true)}
            >
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
                value={amount}
                onChangeText={setAmount}
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
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomFooter}>
          <TouchableOpacity 
            style={[styles.saveButton, (loading || !selectedCategory || !amount) && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading || !selectedCategory || !amount}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="save" size={moderateScale(18)} color="#FFFFFF" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={isCategoryListVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCategoryListVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryListContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setIsCategoryListVisible(false)}>
                <Feather name="x" size={moderateScale(24)} color="#111827" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.categoryItemRow}>
                  <TouchableOpacity 
                    style={styles.categoryItemMain}
                    onPress={() => {
                      setSelectedCategory(item);
                      setIsCategoryListVisible(false);
                    }}
                  >
                    <Text style={[styles.categoryItemText, selectedCategory === item && styles.selectedCategoryItemText]}>
                      {item}
                    </Text>
                    {selectedCategory === item && (
                      <Feather name="check" size={moderateScale(18)} color="#FA8C4C" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteCategoryButton}
                    onPress={() => handleDeleteCategory(item)}
                  >
                    <Feather name="trash-2" size={moderateScale(18)} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* New Category Modal */}
      <Modal
        visible={isNewCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsNewCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newCategoryContainer}>
            <Text style={styles.modalTitle}>Create New Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter category name..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsNewCategoryModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleCreateCategory}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: '#9CA3AF',
  },
  dropdownText: {
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
    fontWeight: '500',
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
  disabledButton: {
    backgroundColor: "#FDBA74",
  },
  saveIcon: {
    marginRight: scale(8),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryListContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: '80%',
    paddingBottom: verticalScale(30),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  categoryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  categoryItemMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingLeft: scale(20),
    paddingRight: scale(10),
  },
  deleteCategoryButton: {
    padding: scale(16),
  },
  categoryItemText: {
    fontSize: moderateScale(16, 0.3),
    color: '#4B5563',
  },
  selectedCategoryItemText: {
    color: '#FA8C4C',
    fontWeight: '600',
  },
  newCategoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    margin: scale(20),
    padding: scale(24),
    marginBottom: '50%', // Offset for keyboard
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    paddingVertical: verticalScale(8),
    marginVertical: verticalScale(20),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    marginRight: scale(8),
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#FA8C4C',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
  },
});
