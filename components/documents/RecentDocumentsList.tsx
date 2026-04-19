import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../utils/i18n';

interface DocumentProp {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  itemCount: number;
  status: 'Processed' | 'Pending Review';
  tag: string;
}

const MOCK_DOCS: DocumentProp[] = [
  {
    id: '1',
    supplier: 'Fresh Farms Ltd',
    invoiceNumber: '#88291',
    date: 'Feb 24, 2026',
    amount: '$1,240.50',
    itemCount: 12,
    status: 'Processed',
    tag: 'AUTO-CATEGORIZED',
  },
  {
    id: '2',
    supplier: 'Bakery Goods Co',
    invoiceNumber: '#BK-442',
    date: 'Feb 23, 2026',
    amount: '$425.00',
    itemCount: 4,
    status: 'Pending Review',
    tag: 'FLAGGED PRICE CHANGE',
  },
  {
    id: '3',
    supplier: 'Ocean Catch Seafood',
    invoiceNumber: '#OC-901',
    date: 'Jan 21, 2026',
    amount: '$2,110.25',
    itemCount: 8,
    status: 'Processed',
    tag: 'VERIFIED',
  },
];

const DocumentCard = ({ doc, router }: { doc: DocumentProp, router: any }) => {
  const { t } = useTranslation();
  const isPending = doc.status === 'Pending Review';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.supplierName}>{doc.supplier}</Text>
          <Text style={styles.invoiceDetails}>{doc.invoiceNumber} • {doc.date}</Text>
        </View>
        <View style={[styles.statusBadge, isPending ? styles.statusWarning : styles.statusSuccess]}>
          <Text style={[styles.statusText, isPending ? styles.statusWarningText : styles.statusSuccessText]}>
            {doc.status === 'Pending Review' ? t('status_pending') : t('status_processed')}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountText}>{doc.amount}</Text>
        <View style={styles.metaBox}>
          <Text style={styles.itemCountText}>{doc.itemCount} {t('items')}</Text>
          <View style={styles.divider} />
          <Text style={[styles.tagText, isPending && styles.tagWarningText]}>{doc.tag}</Text>
        </View>
      </View>

      {isPending ? (
        <View style={styles.actionRowWarning}>
          <TouchableOpacity style={styles.reviewButton} onPress={() => router.push(`/(tabs)/documents/${doc.id}`)}>
            <Feather name="file-text" size={moderateScale(14)} color="#FA8C4C" style={{ marginRight: scale(6)}} />
            <Text style={styles.reviewButtonText}>{t('review')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-horizontal" size={moderateScale(16)} color="#4B5563" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionRowPrimary}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/(tabs)/documents/${doc.id}`)}>
            <Feather name="eye" size={moderateScale(14)} color="#4B5563" style={{ marginRight: scale(6)}} />
            <Text style={styles.actionButtonText}>{t('view')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

interface RecentDocumentsListProps {
  documents?: any[];
  loading?: boolean;
}

export default function RecentDocumentsList({ documents, loading }: RecentDocumentsListProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FA8C4C" />
      </View>
    );
  }

  const getStatus = (status: string): 'Processed' | 'Pending Review' => {
    return status === 'processed' ? 'Processed' : 'Pending Review';
  };

  const displayDocs: DocumentProp[] = (documents || []).map(item => ({
    id: item.id,
    supplier: item.counterparty_name || item.supplier_name || 'Unknown Supplier',
    invoiceNumber: item.document_number || item.invoice_number || 'N/A',
    date: item.document_date || item.invoice_date_formatted || item.invoice_date || 'N/A',
    amount: `€${(item.total_amount || 0).toFixed(2)}`,
    itemCount: item.line_item_count || 0,
    status: getStatus(item.status),
    tag: item.status === 'processed' ? 'AUTO-EXTRACTED' : 'PENDING',
  }));

  const docsToRender = displayDocs;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('recent_documents')}</Text>
      {docsToRender.length > 0 ? (
        docsToRender.map(doc => (
          <DocumentCard key={doc.id} doc={doc} router={router} />
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Feather name="file-text" size={moderateScale(48)} color="#E5E7EB" />
          <Text style={styles.emptyStateText}>{t('no_documents')}</Text>
          <Text style={styles.emptyStateSubtext}>{t('no_documents_subtext')}</Text>
        </View>
      )}
    </View>
  );
}

import { ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(100), // Lots of bottom padding for tab bar
  },
  sectionTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  supplierName: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  invoiceDetails: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  statusSuccess: {
    backgroundColor: '#E6F4EA',
  },
  statusWarning: {
    backgroundColor: '#FFF4E5',
  },
  statusText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '600',
  },
  statusSuccessText: {
    color: '#10B981',
  },
  statusWarningText: {
    color: '#D97706',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  amountText: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: moderateScale(9, 0.3),
    fontWeight: '700',
    color: '#9CA3AF',
  },
  divider: {
    width: 1,
    height: verticalScale(10),
    backgroundColor: '#E5E7EB',
    marginHorizontal: scale(8),
  },
  tagText: {
    fontSize: moderateScale(9, 0.3),
    fontWeight: '700',
    color: '#9CA3AF',
  },
  tagWarningText: {
    color: '#D97706',
  },
  actionRowPrimary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionRowWarning: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: verticalScale(10),
    borderRadius: scale(12),
    marginHorizontal: scale(4),
  },
  actionButtonText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
    color: '#4B5563',
  },
  reviewButton: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0E5',
    paddingVertical: verticalScale(10),
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  reviewButtonText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#FA8C4C',
  },
  moreButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: verticalScale(10),
    borderRadius: scale(12),
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginTop: verticalScale(12),
  },
  emptyStateSubtext: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    marginTop: verticalScale(4),
  },
});
