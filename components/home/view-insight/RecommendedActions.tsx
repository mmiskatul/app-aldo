import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { SparklesIcon, DocumentTextIcon, CheckCircleIcon } from 'react-native-heroicons/outline';

interface Action {
  title: string;
  description: string;
  action_label: string;
}

interface RecommendedActionsProps {
  actions?: Action[];
  onApply?: (action: Action, index: number) => void;
}

export default function RecommendedActions({ actions = [], onApply }: RecommendedActionsProps) {
  const [appliedIndexes, setAppliedIndexes] = React.useState<Record<number, boolean>>({});

  if (!actions || actions.length === 0) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SparklesIcon size={moderateScale(20)} color="#FB923C" />
        <Text style={styles.headerTitle}>Recommended Actions</Text>
      </View>
      
      {actions.map((action, index) => {
        const isApplied = Boolean(appliedIndexes[index]);
        const IconComponent = isApplied
          ? <CheckCircleIcon size={moderateScale(20)} color="#16A34A" />
          : <DocumentTextIcon size={moderateScale(20)} color="#FB923C" />;
        return (
          <View key={index} style={[styles.actionCard, isApplied && styles.actionCardApplied]}>
            <View style={styles.iconContainer}>
              {IconComponent}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setAppliedIndexes((current) => ({ ...current, [index]: true }));
                onApply?.(action, index);
              }}
            >
              <Text style={[styles.applyText, isApplied && styles.appliedText]}>
                {isApplied ? 'Applied' : action.action_label || 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginLeft: scale(8),
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED', // Light orange
    padding: scale(16),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  actionCardApplied: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
    marginRight: scale(8),
  },
  actionTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  actionDescription: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    lineHeight: moderateScale(16, 0.3),
  },
  applyText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FB923C',
  },
  appliedText: {
    color: '#16A34A',
  },
});
