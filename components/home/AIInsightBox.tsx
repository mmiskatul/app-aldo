import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { CpuChipIcon, ArrowRightIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import Skeleton from '../ui/Skeleton';

interface AIInsightProps {
  insight?: {
    title: string;
    summary: string;
  };
  loading?: boolean;
  onNavigate?: (route: string) => void;
}

export default function AIInsightBox({ insight, loading = false, onNavigate }: AIInsightProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!loading && !insight) {
    return null;
  }
  const displayInsight = insight ?? { title: "", summary: "" };

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <View style={styles.header}>
            <Skeleton width={scale(18)} height={scale(18)} borderRadius={9} style={styles.icon} />
            <Skeleton width="48%" height={moderateScale(10)} borderRadius={5} />
          </View>
          <Skeleton width="92%" height={moderateScale(14)} borderRadius={7} />
          <Skeleton width="84%" height={moderateScale(14)} borderRadius={7} style={styles.textGap} />
          <Skeleton width="76%" height={moderateScale(14)} borderRadius={7} style={styles.textGap} />
          <Skeleton width={scale(118)} height={verticalScale(34)} borderRadius={8} style={styles.buttonSkeleton} />
        </>
      ) : (
        <>
          <View style={styles.header}>
            <CpuChipIcon size={moderateScale(14)} color="#FA8C4C" style={styles.icon} />
            <Text style={styles.headerText}>{displayInsight.title.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.insightText}>
            {displayInsight.summary}
          </Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (onNavigate) {
                onNavigate("/(tabs)/home/view-insight");
                return;
              }
              router.push("/(tabs)/home/view-insight");
            }}
          >
            <Text style={styles.actionText}>{t('view_insight')}</Text>
            <ArrowRightIcon size={moderateScale(14)} color="#FFFFFF" style={styles.arrow} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#352109',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  icon: {
    marginRight: scale(6),
  },
  headerText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    color: '#D1D5DB',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: moderateScale(22, 0.3),
    marginBottom: verticalScale(20),
    width: '90%',
  },
  textGap: {
    marginTop: verticalScale(8),
  },
  actionButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FA8C4C',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
  },
  buttonSkeleton: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: verticalScale(20),
  },
  actionText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrow: {
    marginLeft: scale(6),
  },
});
