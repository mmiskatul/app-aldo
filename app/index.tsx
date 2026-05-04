import { Feather } from "@expo/vector-icons";
import { useRouter, Redirect } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { getRestrictedAccessStatus, useAppStore } from "../store/useAppStore";
import LanguageModal from "../components/home/LanguageModal";
import { useTranslation } from "../utils/i18n";

// @ts-ignore
import BackgroundSVG from "../assets/images/onboarding/Background+Border+Shadow.svg";
// @ts-ignore
import ContainerSVG from "../assets/images/onboarding/Container.svg";
// @ts-ignore
import AIChatSVG from "../assets/images/onboarding/AI Chat Interface Mockup.svg";

const slides = [
  {
    id: "1",
    titleKey: "intro_slide_profit_title",
    descriptionKey: "intro_slide_profit_description",
    ImageComponent: ContainerSVG,
    showSkip: true,
  },
  {
    id: "2",
    titleKey: "intro_slide_photo_upload_title",
    descriptionKey: "intro_slide_photo_upload_description",
    ImageComponent: BackgroundSVG,
    showSkip: true,
  },
  {
    id: "3",
    titleKey: "intro_slide_inventory_title",
    descriptionKey: "intro_slide_inventory_description",
    ImageComponent: ContainerSVG,
    showSkip: false,
  },
  {
    id: "4",
    titleKey: "intro_slide_vat_title",
    descriptionKey: "intro_slide_vat_description",
    ImageComponent: BackgroundSVG,
    showSkip: false,
  },
  {
    id: "5",
    titleKey: "intro_slide_manage_title",
    descriptionKey: "intro_slide_manage_description",
    ImageComponent: ContainerSVG,
    showSkip: false,
  },
  {
    id: "6",
    titleKey: "intro_slide_chat_title",
    descriptionKey: "intro_slide_chat_description",
    ImageComponent: AIChatSVG,
    showSkip: false,
  },
] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const slidesRef = useRef<FlatList<any>>(null);
  const router = useRouter();
  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const user = useAppStore((state) => state.user);
  const appLanguage = useAppStore((state) => state.appLanguage);
  const setAppLanguage = useAppStore((state) => state.setAppLanguage);
  const hasRestrictedAccess = getRestrictedAccessStatus(user) !== null;

  if (user) {
    if (hasRestrictedAccess) {
      return <Redirect href="/(tabs)/settings/restricted-access" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/(auth)" as any);
    }
  };

  const skipToAuth = () => {
    router.replace("/(auth)" as any);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      slidesRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerContainer,
          {
            marginTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerStep}>
          <TouchableOpacity
            style={[styles.backButton, { opacity: currentIndex > 0 ? 1 : 0 }]}
            onPress={goBack}
            disabled={currentIndex === 0}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.stepText}>
            {t("intro_step_label", { step: currentIndex + 1, total: slides.length })}
          </Text>
          <TouchableOpacity style={styles.langSelector} onPress={() => setIsLangMenuOpen(true)}>
            <Text style={styles.langText}>{appLanguage === "it" ? "Ita" : "Eng"}</Text>
            <Feather
              name="chevron-down"
              size={16}
              color="#4B5563"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList<any>
        data={slides}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.imageContainer}>
              <item.ImageComponent width={width * 0.8} height={width * 0.8} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t(item.titleKey)}</Text>
              <Text style={styles.description}>{t(item.descriptionKey)}</Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
        ]}
      >
        <Paginator data={slides} currentIndex={currentIndex} />

        <TouchableOpacity style={styles.mainButton} onPress={scrollToNext}>
          <Text style={styles.mainButtonText}>
            {currentIndex === slides.length - 1 ? t("get_started") : t("next")}
          </Text>
          {currentIndex > 0 && (
            <Feather
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 6 }}
            />
          )}
        </TouchableOpacity>

        {currentSlide.showSkip ? (
          <TouchableOpacity style={styles.skipButton} onPress={skipToAuth}>
            <Text style={styles.skipText}>{t("skip_intro")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButtonPlaceholder} />
        )}
      </View>
      <LanguageModal
        visible={isLangMenuOpen}
        onClose={() => setIsLangMenuOpen(false)}
        selectedLang={appLanguage}
        onSelectLang={(lang) => {
          setAppLanguage(lang);
          setIsLangMenuOpen(false);
        }}
      />
    </View>
  );
}

const Paginator = ({
  data,
  currentIndex,
}: {
  data: readonly any[];
  currentIndex: number;
}) => {
  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => (
        <View
          key={`dot-${i}`}
          style={[
            styles.dot,
            {
              width: i === currentIndex ? scale(24) : scale(8),
              backgroundColor: i === currentIndex ? "#FA8C4C" : "#E5E7EB",
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: scale(24),
    height: verticalScale(60),
    justifyContent: "center",
  },
  headerStep: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "800",
    color: "#FA8C4C",
  },
  langSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0E5",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
  },
  langText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  slide: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    flex: 0.6,
    width: "100%",
    paddingHorizontal: scale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 0.4,
    paddingHorizontal: scale(32),
    alignItems: "center",
    paddingTop: verticalScale(10),
  },
  title: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: verticalScale(16),
    lineHeight: moderateScale(34, 0.3),
  },
  description: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: moderateScale(24, 0.3),
  },
  bottomContainer: {
    paddingHorizontal: scale(24),
    alignItems: "center",
  },
  paginatorContainer: {
    flexDirection: "row",
    height: verticalScale(10),
    marginBottom: verticalScale(32),
  },
  dot: {
    height: verticalScale(8),
    borderRadius: scale(4),
    marginHorizontal: scale(4),
  },
  mainButton: {
    backgroundColor: "#FA8C4C",
    width: "100%",
    height: verticalScale(56),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: verticalScale(12),
  },
  mainButtonText: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  skipButton: {
    height: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "600",
    color: "#9CA3AF",
  },
  skipButtonPlaceholder: {
    height: verticalScale(40),
  },
});
