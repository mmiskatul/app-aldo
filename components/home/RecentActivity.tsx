import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { DocumentArrowUpIcon, ClipboardDocumentListIcon, BoltIcon, ArchiveBoxIcon, BuildingLibraryIcon } from 'react-native-heroicons/outline';
import { useTranslation } from '../../utils/i18n';
import Skeleton from '../ui/Skeleton';

interface ActivityItemProps {
  title: string;
  subtitle: string;
  timeText: string;
  IconComponent: any;
  iconBgColor: string;
  iconColor: string;
  route?: string | null;
}

const ActivityItem = ({ title, subtitle, timeText, IconComponent, iconBgColor, iconColor, route }: ActivityItemProps) => {
  const router = useRouter();
  const content = (
    <>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <IconComponent size={moderateScale(16)} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.timeText}>{timeText}</Text>
    </>
  );

  if (route) {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => router.push(route as any)}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.itemContainer}>
      {content}
    </View>
  );
};

interface RecentActivityProps {
  activities?: any[];
  loading?: boolean;
}

export default function RecentActivity({ activities: apiActivities, loading = false }: RecentActivityProps) {
  const { t } = useTranslation();

  const getIconForType = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'invoice':
        return { IconComponent: DocumentArrowUpIcon, iconBgColor: '#FFF0E5', iconColor: '#FA8C4C' };
      case 'expense':
        return { IconComponent: ClipboardDocumentListIcon, iconBgColor: '#FEE2E2', iconColor: '#EF4444' };
      case 'inventory':
        return { IconComponent: ArchiveBoxIcon, iconBgColor: '#E0F2FE', iconColor: '#0284C7' };
      case 'cash':
        return { IconComponent: BuildingLibraryIcon, iconBgColor: '#DCFCE7', iconColor: '#16A34A' };
      case 'daily_record':
        return { IconComponent: BoltIcon, iconBgColor: '#FEF3C7', iconColor: '#D97706' };
      default:
        return { IconComponent: BoltIcon, iconBgColor: '#FEF3C7', iconColor: '#D97706' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return t('just_now');
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return t('just_now');
    if (diffHrs < 24) return `${diffHrs}H AGO`;
    return `${Math.floor(diffHrs / 24)}D AGO`;
  };

  const displayActivities: ActivityItemProps[] =
    apiActivities && apiActivities.length > 0
      ? apiActivities.map((activity) => ({
          title: activity.title || 'Activity',
          subtitle: activity.subtitle || '',
          timeText: formatTimestamp(activity.timestamp),
          route:
            activity.kind === 'cash' && activity.entity_id
              ? `/(tabs)/home/cash-transaction-details?id=${activity.entity_id}`
              : activity.route,
          ...getIconForType(activity.kind),
        }))
      : [];

  const skeletonRows = [0, 1, 2];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('recent_activity')}</Text>
        <Text style={styles.seeAllText}>{t('see_all')}</Text>
      </View>

      <View style={styles.cardContainer}>
        {loading ? (
          skeletonRows.map((index) => (
            <View key={index}>
              <View style={styles.itemContainer}>
                <View style={styles.itemLeft}>
                  <Skeleton width={scale(40)} height={scale(40)} borderRadius={scale(20)} />
                  <View style={styles.textContainer}>
                    <Skeleton width="66%" height={moderateScale(13)} borderRadius={7} />
                    <Skeleton width="82%" height={moderateScale(11)} borderRadius={6} style={styles.subtitleSkeleton} />
                  </View>
                </View>
                <Skeleton width={scale(42)} height={moderateScale(10)} borderRadius={6} />
              </View>
              {index < skeletonRows.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        ) : displayActivities.length > 0 ? (
          displayActivities.map((item, index) => (
            <View key={`${item.title}-${index}`}>
              <ActivityItem {...item} />
              {index < displayActivities.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{t('no_recent_activity')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(100),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '600',
    color: '#FA8C4C',
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
    alignItems: 'flex-start',
    paddingVertical: verticalScale(10),
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  itemSubtitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  subtitleSkeleton: {
    marginTop: verticalScale(6),
  },
  timeText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: verticalScale(4),
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(4),
  },
  emptyText: {
    fontSize: moderateScale(14, 0.3),
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: verticalScale(20),
    fontWeight: '500',
  },
});
