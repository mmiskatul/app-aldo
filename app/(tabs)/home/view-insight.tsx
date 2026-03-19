import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { ArrowDownTrayIcon } from 'react-native-heroicons/outline';
import { Stack, useRouter } from 'expo-router';

// Components
import Header from '../../../components/ui/Header';
import { Feather } from "@expo/vector-icons";
import InsightSummaryCard from '../../../components/home/view-insight/InsightSummaryCard';
import RootCauses from '../../../components/home/view-insight/RootCauses';
import RecommendedActions from '../../../components/home/view-insight/RecommendedActions';
import OtherInsights from '../../../components/home/view-insight/OtherInsights';

export default function ViewInsightScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(120) 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header 
          title="AI Business Insight" 
          showBack={true} 
          showBell={true} 
          titleAlign="left"
        />
        <InsightSummaryCard />
        <RootCauses />
        <RecommendedActions />
        <OtherInsights />
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: verticalScale(20) }]}>
        <TouchableOpacity style={styles.exportButton}>
          <ArrowDownTrayIcon size={moderateScale(20)} color="#FFFFFF" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  notificationButton: {
    padding: scale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: "absolute",
    top: scale(8),
    right: scale(8),
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#EF4444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(24),
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  exportButton: {
    backgroundColor: '#FA8C4C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: verticalScale(50),
    borderRadius: scale(12),
  },
  exportText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },
});
