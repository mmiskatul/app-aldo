import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { DocumentArrowUpIcon, ClipboardDocumentListIcon, BoltIcon, ArchiveBoxIcon, BuildingLibraryIcon } from 'react-native-heroicons/outline';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../utils/i18n';
import { resolveLocalizedText, type LocalizedText } from '../../utils/localizedContent';
import Skeleton from '../ui/Skeleton';

type AppLanguage = 'en' | 'it';

interface ActivityRecord {
  kind?: string;
  title?: string;
  subtitle?: string;
  timestamp?: string;
  entity_id?: string;
  reference_date?: string;
  route?: string;
  source_kind?: string;
  source_entity_id?: string;
  title_translations?: LocalizedText;
  subtitle_translations?: LocalizedText;
}

interface ActivityItemProps {
  title: string;
  subtitle: string;
  timeText: string;
  IconComponent: any;
  iconBgColor: string;
  iconColor: string;
  route?: string | null;
  onNavigate?: (route: string) => void;
}

const ActivityItem = ({ title, subtitle, timeText, IconComponent, iconBgColor, iconColor, route, onNavigate }: ActivityItemProps) => {
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
        onPress={() => {
          if (onNavigate) {
            onNavigate(route);
            return;
          }
          router.push(route as any);
        }}
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
  activities?: ActivityRecord[];
  loading?: boolean;
  onNavigate?: (route: string) => void;
  onSeeAll?: () => void;
  showHeader?: boolean;
  bottomSpacing?: number;
}

const activityTitlePairs = [
  { en: 'Daily data', it: 'Dati giornalieri' },
  { en: 'Invoice uploaded', it: 'Fattura caricata' },
  { en: 'Daily data expense', it: 'Spesa dati giornalieri' },
  { en: 'Document expense', it: 'Spesa documento' },
  { en: 'Inventory expense', it: 'Spesa inventario' },
  { en: 'Expense added', it: 'Spesa aggiunta' },
  { en: 'Bank deposit logged', it: 'Deposito bancario registrato' },
  { en: 'Cash deposit logged', it: 'Deposito cassa registrato' },
  { en: 'POS payment recorded', it: 'Pagamento POS registrato' },
  { en: 'Cash in recorded', it: 'Entrata cassa registrata' },
  { en: 'Bank transfer recorded', it: 'Bonifico registrato' },
  { en: 'Cash withdrawal recorded', it: 'Prelievo cassa registrato' },
  { en: 'Cash out recorded', it: 'Uscita cassa registrata' },
  { en: 'Cash expense recorded', it: 'Spesa in contanti registrata' },
  { en: 'Cash transaction recorded', it: 'Movimento di cassa registrato' },
  { en: 'Inventory item added', it: 'Articolo inventario aggiunto' },
];

const normalizeActivityText = (value?: string | null) => (value || '').trim().toLowerCase();

const formatActivityDateTitle = (referenceDate: string | undefined, language: AppLanguage) => {
  if (!referenceDate) {
    return language === 'it' ? 'Dati giornalieri' : 'Daily data';
  }

  const parsed = new Date(`${referenceDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return language === 'it' ? 'Dati giornalieri' : 'Daily data';
  }

  const monthNames =
    language === 'it'
      ? ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${String(parsed.getDate()).padStart(2, '0')} ${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
};

const localizeKnownActivityTitle = (title: string, language: AppLanguage) => {
  const normalizedTitle = normalizeActivityText(title);
  const matchedTitle = activityTitlePairs.find(
    (item) => normalizeActivityText(item.en) === normalizedTitle || normalizeActivityText(item.it) === normalizedTitle,
  );

  if (!matchedTitle) {
    return title;
  }

  return matchedTitle[language];
};

const localizeKnownActivitySubtitle = (subtitle: string, language: AppLanguage) => {
  if (!subtitle) {
    return '';
  }

  if (language === 'it') {
    return subtitle
      .replace(/\bRevenue\b/g, 'Ricavi')
      .replace(/\bCovers\b/g, 'Coperti')
      .replace(/\bAvg\b/g, 'Media')
      .replace(/\bDocument\b/g, 'Documento')
      .replace(/\bInventory\b/g, 'Inventario');
  }

  return subtitle
    .replace(/\bRicavi\b/g, 'Revenue')
    .replace(/\bCoperti\b/g, 'Covers')
    .replace(/\bMedia\b/g, 'Avg')
    .replace(/\bDocumento\b/g, 'Document')
    .replace(/\bInventario\b/g, 'Inventory');
};

const resolveActivityTitle = (activity: ActivityRecord, language: AppLanguage, fallback: string) => {
  if (activity.kind === 'daily_record') {
    return formatActivityDateTitle(activity.reference_date, language);
  }

  const resolvedTitle = resolveLocalizedText(language, activity.title_translations, activity.title || fallback);
  return localizeKnownActivityTitle(resolvedTitle || fallback, language);
};

const resolveActivitySubtitle = (activity: ActivityRecord, language: AppLanguage) => {
  const resolvedSubtitle = resolveLocalizedText(language, activity.subtitle_translations, activity.subtitle || '');
  return localizeKnownActivitySubtitle(resolvedSubtitle, language);
};

const resolveActivityRoute = (activity: ActivityRecord) => {
  if (!activity) {
    return null;
  }

  const sourceKind = activity.source_kind || activity.kind;
  const sourceEntityId = activity.source_entity_id || activity.entity_id;

  switch (sourceKind) {
    case 'daily_record':
      return sourceEntityId
        ? `/(tabs)/home/daily-record-details?dataId=${sourceEntityId}`
        : activity.route;
    case 'inventory':
      return sourceEntityId ? `/(tabs)/inventory/${sourceEntityId}` : activity.route;
    case 'invoice':
      return sourceEntityId ? `/(tabs)/documents/${sourceEntityId}` : activity.route;
    case 'cash':
      return sourceEntityId
        ? `/(tabs)/home/cash-transaction-details?id=${sourceEntityId}`
        : activity.route;
    case 'expense':
      return sourceEntityId
        ? `/(tabs)/home/expense-details?id=${sourceEntityId}`
        : activity.route;
    default:
      return activity.route;
  }
};

export default function RecentActivity({
  activities: apiActivities,
  loading = false,
  onNavigate,
  onSeeAll,
  showHeader = true,
  bottomSpacing,
}: RecentActivityProps) {
  const { t } = useTranslation();
  const appLanguage = useAppStore((state) => state.appLanguage);

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

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return t('just_now');
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return t('just_now');
    if (diffHrs < 24) return `${diffHrs}${t('hours_ago_suffix')}`;
    return `${Math.floor(diffHrs / 24)}${t('days_ago_suffix')}`;
  };

  const displayActivities: ActivityItemProps[] =
    apiActivities && apiActivities.length > 0
      ? apiActivities.map((activity) => ({
          title: resolveActivityTitle(activity, appLanguage, t('activity')),
          subtitle: resolveActivitySubtitle(activity, appLanguage),
          timeText: formatTimestamp(activity.timestamp),
          route: resolveActivityRoute(activity),
          onNavigate,
          ...getIconForType(activity.kind),
        }))
      : [];

  const skeletonRows = [0, 1, 2];

  return (
    <View style={[styles.container, bottomSpacing !== undefined && { marginBottom: bottomSpacing }]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>{t('recent_activity')}</Text>
          {onSeeAll ? (
            <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll} hitSlop={styles.seeAllHitSlop}>
              <Text style={styles.seeAllText}>{t('see_all')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.seeAllText}>{t('see_all')}</Text>
          )}
        </View>
      )}

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
  seeAllHitSlop: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
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
