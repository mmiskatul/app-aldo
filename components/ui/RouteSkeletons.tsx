import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import Skeleton, { SkeletonCard } from "./Skeleton";

export function DashboardRouteSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Skeleton width="48%" height={moderateScale(18)} borderRadius={8} />
      <Skeleton width="72%" height={moderateScale(42)} borderRadius={14} style={styles.sectionGap} />

      <View style={[styles.row, styles.sectionGap]}>
        <Skeleton width="48%" height={moderateScale(38)} borderRadius={20} />
        <Skeleton width="28%" height={moderateScale(38)} borderRadius={20} />
      </View>

      <SkeletonCard style={styles.sectionGap}>
        <Skeleton width="36%" height={moderateScale(12)} borderRadius={6} />
        <Skeleton width="74%" height={moderateScale(26)} borderRadius={8} style={styles.smallGap} />
        <Skeleton width="92%" height={moderateScale(14)} borderRadius={7} />
        <Skeleton width="64%" height={moderateScale(14)} borderRadius={7} style={styles.smallGap} />
      </SkeletonCard>

      <View style={[styles.grid, styles.sectionGap]}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} style={styles.gridCard}>
            <Skeleton width="50%" height={moderateScale(11)} borderRadius={6} />
            <Skeleton width="80%" height={moderateScale(24)} borderRadius={8} style={styles.smallGap} />
            <Skeleton width="45%" height={moderateScale(12)} borderRadius={6} />
          </SkeletonCard>
        ))}
      </View>

      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} style={styles.sectionGap}>
          <Skeleton width="42%" height={moderateScale(14)} borderRadius={7} />
          <Skeleton width="100%" height={moderateScale(120)} borderRadius={12} style={styles.smallGap} />
        </SkeletonCard>
      ))}
    </ScrollView>
  );
}

export function ListRouteSkeleton({
  withAction = true,
  itemCount = 4,
}: {
  withAction?: boolean;
  itemCount?: number;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Skeleton width="62%" height={moderateScale(16)} borderRadius={8} />
      <Skeleton width="82%" height={moderateScale(14)} borderRadius={7} style={styles.smallGap} />

      {withAction && (
        <Skeleton width="100%" height={moderateScale(48)} borderRadius={14} style={styles.sectionGap} />
      )}

      <View style={[styles.row, styles.sectionGap]}>
        <Skeleton width={moderateScale(88)} height={moderateScale(34)} borderRadius={18} />
        <Skeleton width={moderateScale(104)} height={moderateScale(34)} borderRadius={18} />
        <Skeleton width={moderateScale(112)} height={moderateScale(34)} borderRadius={18} />
      </View>

      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard key={index} style={styles.sectionGap}>
          <View style={styles.rowBetween}>
            <Skeleton width="38%" height={moderateScale(14)} borderRadius={7} />
            <Skeleton width={moderateScale(78)} height={moderateScale(24)} borderRadius={12} />
          </View>
          <Skeleton width="68%" height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />
          <View style={styles.rowBetween}>
            <Skeleton width="30%" height={moderateScale(24)} borderRadius={10} />
            <Skeleton width="42%" height={moderateScale(10)} borderRadius={5} />
          </View>
          <Skeleton width="100%" height={moderateScale(42)} borderRadius={12} style={styles.mediumGap} />
        </SkeletonCard>
      ))}
    </ScrollView>
  );
}

export function DetailRouteSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Skeleton width="58%" height={moderateScale(18)} borderRadius={8} />
      <Skeleton width="84%" height={moderateScale(14)} borderRadius={7} style={styles.smallGap} />

      <SkeletonCard style={styles.sectionGap}>
        <Skeleton width="100%" height={verticalScale(220)} borderRadius={16} />
      </SkeletonCard>

      <SkeletonCard style={styles.sectionGap}>
        <View style={styles.rowBetween}>
          <Skeleton width="46%" height={moderateScale(14)} borderRadius={7} />
          <Skeleton width={moderateScale(90)} height={moderateScale(24)} borderRadius={12} />
        </View>
        <Skeleton width="72%" height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />
        <Skeleton width="34%" height={moderateScale(28)} borderRadius={8} style={styles.mediumGap} />
        <Skeleton width="100%" height={moderateScale(12)} borderRadius={6} />
        <Skeleton width="92%" height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />
        <Skeleton width="76%" height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />
      </SkeletonCard>

      <SkeletonCard style={styles.sectionGap}>
        <Skeleton width="36%" height={moderateScale(14)} borderRadius={7} />
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.rowBetween, styles.mediumGap]}>
            <Skeleton width="50%" height={moderateScale(12)} borderRadius={6} />
            <Skeleton width="18%" height={moderateScale(12)} borderRadius={6} />
            <Skeleton width="20%" height={moderateScale(12)} borderRadius={6} />
          </View>
        ))}
      </SkeletonCard>

      <View style={[styles.row, styles.sectionGap]}>
        <Skeleton width="31%" height={moderateScale(44)} borderRadius={14} />
        <Skeleton width="31%" height={moderateScale(44)} borderRadius={14} />
        <Skeleton width="31%" height={moderateScale(44)} borderRadius={14} />
      </View>
    </ScrollView>
  );
}

export function ChatRouteSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.chatContent}
    >
      <View style={styles.chatGroup}>
        <Skeleton width="44%" height={moderateScale(14)} borderRadius={7} />
        <Skeleton width="88%" height={moderateScale(88)} borderRadius={18} style={styles.mediumGap} />
      </View>

      <View style={[styles.chatGroup, styles.chatGroupRight]}>
        <Skeleton width="34%" height={moderateScale(14)} borderRadius={7} style={styles.alignRight} />
        <Skeleton width="72%" height={moderateScale(64)} borderRadius={18} style={[styles.mediumGap, styles.alignRight]} />
      </View>

      <View style={styles.chatGroup}>
        <Skeleton width="40%" height={moderateScale(14)} borderRadius={7} />
        <Skeleton width="82%" height={moderateScale(112)} borderRadius={18} style={styles.mediumGap} />
      </View>
    </ScrollView>
  );
}

export function TextRouteSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Skeleton width="52%" height={moderateScale(24)} borderRadius={10} />
      <Skeleton width="34%" height={moderateScale(12)} borderRadius={6} style={styles.mediumGap} />
      <Skeleton width="28%" height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />

      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.sectionGap}>
          <Skeleton width={index % 2 === 0 ? "100%" : "94%"} height={moderateScale(12)} borderRadius={6} />
          <Skeleton width={index % 2 === 0 ? "92%" : "100%"} height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />
          <Skeleton width={index % 2 === 0 ? "78%" : "86%"} height={moderateScale(12)} borderRadius={6} style={styles.smallGap} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  chatContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    gap: verticalScale(20),
  },
  sectionGap: {
    marginTop: verticalScale(18),
  },
  smallGap: {
    marginTop: verticalScale(8),
  },
  mediumGap: {
    marginTop: verticalScale(12),
  },
  row: {
    flexDirection: "row",
    gap: scale(10),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  gridCard: {
    width: "48%",
  },
  chatGroup: {
    width: "100%",
  },
  chatGroupRight: {
    alignItems: "flex-end",
  },
  alignRight: {
    alignSelf: "flex-end",
  },
});
