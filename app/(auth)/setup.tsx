import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import apiClient from "../../api/apiClient";
import { getCurrentUser, hasCompletedOnboarding } from "../../api/auth";
import Step1RestaurantInfo from "../../components/auth/restoAi/Step1RestaurantInfo";
import Step2RestaurantDetails from "../../components/auth/restoAi/Step2RestaurantDetails";
import Step3PhotoUpload from "../../components/auth/restoAi/Step3PhotoUpload";
import Step4BusinessGoal from "../../components/auth/restoAi/Step4BusinessGoal";
import Step5BiggestChallenge from "../../components/auth/restoAi/Step5BiggestChallenge";
import StepFeatureExplanation from "../../components/auth/restoAi/StepFeatureExplanation";
import Step6Success from "../../components/auth/restoAi/Step6Success";
import { useAppStore } from "../../store/useAppStore";
import { buildFileName, inferMimeType } from "../../utils/fileMetadata";
import { getApiErrorMessage } from "../../utils/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";
import LanguageModal from "../../components/home/LanguageModal";

type OnboardingProfileResponse = {
  restaurant_name?: string | null;
  restaurant_type?: string | null;
  city_location?: string | null;
  number_of_seats?: number | null;
  average_spend_per_customer?: number | null;
  profile_image_url?: string | null;
  interior_photo_url?: string | null;
  exterior_photo_url?: string | null;
  main_business_goal?: string | null;
  biggest_problem?: string | null;
  improvement_focus?: string | null;
};

type OnboardingFeatureScreen = {
  key: string;
  icon: string;
  title: string;
  description: string;
  points: string[];
};

const FALLBACK_FEATURE_SCREENS: OnboardingFeatureScreen[] = [
  {
    key: "profit_tracking",
    icon: "trending-up",
    title: "",
    description: "",
    points: [],
  },
  {
    key: "invoice_photo_upload",
    icon: "camera",
    title: "",
    description: "",
    points: [],
  },
  {
    key: "inventory",
    icon: "archive",
    title: "",
    description: "",
    points: [],
  },
  {
    key: "vat_management",
    icon: "file-text",
    title: "",
    description: "",
    points: [],
  },
];

const FALLBACK_FEATURE_COPY: Record<string, { titleKey: string; descriptionKey: string; pointKeys: string[] }> = {
  profit_tracking: {
    titleKey: "intro_slide_profit_detail_title",
    descriptionKey: "intro_slide_profit_detail_description",
    pointKeys: [
      "intro_slide_profit_detail_point_1",
      "intro_slide_profit_detail_point_2",
      "intro_slide_profit_detail_point_3",
    ],
  },
  invoice_photo_upload: {
    titleKey: "intro_slide_photo_upload_detail_title",
    descriptionKey: "intro_slide_photo_upload_detail_description",
    pointKeys: [
      "intro_slide_photo_upload_detail_point_1",
      "intro_slide_photo_upload_detail_point_2",
      "intro_slide_photo_upload_detail_point_3",
    ],
  },
  inventory: {
    titleKey: "intro_slide_inventory_detail_title",
    descriptionKey: "intro_slide_inventory_detail_description",
    pointKeys: [
      "intro_slide_inventory_detail_point_1",
      "intro_slide_inventory_detail_point_2",
      "intro_slide_inventory_detail_point_3",
    ],
  },
  vat_management: {
    titleKey: "intro_slide_vat_detail_title",
    descriptionKey: "intro_slide_vat_detail_description",
    pointKeys: [
      "intro_slide_vat_detail_point_1",
      "intro_slide_vat_detail_point_2",
      "intro_slide_vat_detail_point_3",
    ],
  },
};

const DEFAULT_BUSINESS_GOAL = "Increase revenue";

const parseBusinessGoals = (value?: string | null): string[] => {
  if (!value?.trim()) {
    return [DEFAULT_BUSINESS_GOAL];
  }

  return value
    .split(",")
    .map((goal) => goal.trim())
    .filter(Boolean);
};

export default function SetupScreen() {
  const router = useRouter();
  const setProfile = useAppStore((state) => state.setProfile);
  const setUser = useAppStore((state) => state.setUser);
  const tokens = useAppStore((state) => state.tokens);
  const appLanguage = useAppStore((state) => state.appLanguage);
  const setAppLanguage = useAppStore((state) => state.setAppLanguage);
  const [step, setStep] = useState(1);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [featureScreens, setFeatureScreens] = useState<OnboardingFeatureScreen[]>(FALLBACK_FEATURE_SCREENS);

  // Step 1 State
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantType, setRestaurantType] = useState("");

  // Step 2 State
  const [city, setCity] = useState("");
  const [seats, setSeats] = useState("");
  const [averageSpend, setAverageSpend] = useState("");

  // Step 3 State
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [interiorPhoto, setInteriorPhoto] = useState<string | null>(null);
  const [exteriorPhoto, setExteriorPhoto] = useState<string | null>(null);

  // Step 4 State
  const [businessGoals, setBusinessGoals] = useState<string[]>([DEFAULT_BUSINESS_GOAL]);

  // Step 5 State
  const [biggestProblem, setBiggestProblem] = useState("");
  const [improvementGoal, setImprovementGoal] = useState("");

  const totalSteps = 9;

  useEffect(() => {
    const loadSetupData = async () => {
      try {
        const [user, onboardingResponse] = await Promise.all([
          getCurrentUser(),
          apiClient.get<OnboardingProfileResponse | null>("/api/v1/onboarding/profile"),
        ]);
        const onboarding = onboardingResponse.data;

        if (hasCompletedOnboarding(user)) {
          setUser(user, tokens);
          router.replace("/(tabs)/home" as any);
          return;
        }

        setRestaurantName(onboarding?.restaurant_name || user.restaurant_name || "");
        setRestaurantType(onboarding?.restaurant_type || "");
        setCity(onboarding?.city_location || "");
        setSeats(
          onboarding?.number_of_seats !== undefined && onboarding?.number_of_seats !== null
            ? String(onboarding.number_of_seats)
            : ""
        );
        setAverageSpend(
          onboarding?.average_spend_per_customer !== undefined && onboarding?.average_spend_per_customer !== null
            ? String(onboarding.average_spend_per_customer)
            : ""
        );
        setProfilePhoto(
          onboarding?.profile_image_url ||
            user.profile_image_url ||
            user.avatar_url ||
            null
        );
        setInteriorPhoto(onboarding?.interior_photo_url || null);
        setExteriorPhoto(onboarding?.exterior_photo_url || null);
        setBusinessGoals(parseBusinessGoals(onboarding?.main_business_goal));
        setBiggestProblem(onboarding?.biggest_problem || "");
        setImprovementGoal(onboarding?.improvement_focus || "");

        try {
          const featureResponse = await apiClient.get<{ screens: OnboardingFeatureScreen[] }>(
            "/api/v1/onboarding/feature-screens"
          );
          if (Array.isArray(featureResponse.data?.screens) && featureResponse.data.screens.length > 0) {
            setFeatureScreens(featureResponse.data.screens);
          }
        } catch (featureError: any) {
          if (featureError?.response?.status !== 404) {
            console.log("Error loading onboarding feature screens:", featureError?.response?.data || featureError?.message);
          }
          setFeatureScreens(FALLBACK_FEATURE_SCREENS);
        }
      } catch (error: any) {
        console.error("Error loading onboarding data:", error?.response?.data || error?.message);
      } finally {
        setLoadingInitialData(false);
      }
    };

    void loadSetupData();
  }, []);

  const appendImageFile = (
    formData: FormData,
    fieldName: "profile_image" | "interior_photo" | "exterior_photo",
    uri: string | null,
  ) => {
    if (!uri) {
      return;
    }
    if (/^https?:\/\//i.test(uri)) {
      const urlFieldName =
        fieldName === "profile_image" ? "profile_image_url" : `${fieldName}_url`;
      formData.append(urlFieldName, uri);
      return;
    }
    const mimeType = inferMimeType(uri);
    formData.append(fieldName, {
      uri,
      name: buildFileName(null, uri, fieldName, mimeType),
      type: mimeType,
    } as any);
  };

  const submitOnboarding = async () => {
    if (!restaurantName.trim()) {
      showErrorMessage("Restaurant name is required.");
      setStep(1);
      return;
    }
    if (!restaurantType.trim()) {
      showErrorMessage("Restaurant type is required.");
      setStep(1);
      return;
    }
    if (!city.trim() || !seats.trim() || !averageSpend.trim()) {
      showErrorMessage("Complete the restaurant details before continuing.");
      setStep(2);
      return;
    }
    if (businessGoals.length === 0) {
      showErrorMessage("Select at least one business goal before continuing.");
      setStep(4);
      return;
    }
    if (!biggestProblem.trim() || !improvementGoal.trim()) {
      showErrorMessage("Complete the challenge section before finishing setup.");
      setStep(5);
      return;
    }

    const parsedSeats = Number.parseInt(seats, 10);
    const parsedAverageSpend = Number.parseFloat(averageSpend);
    if (!Number.isFinite(parsedSeats) || parsedSeats <= 0 || !Number.isFinite(parsedAverageSpend) || parsedAverageSpend < 0) {
      showErrorMessage("Enter a valid number of seats and average spend.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("restaurant_name", restaurantName.trim());
      formData.append("restaurant_type", restaurantType.trim());
      formData.append("city_location", city.trim());
      formData.append("number_of_seats", String(parsedSeats));
      formData.append("average_spend_per_customer", String(parsedAverageSpend));
      formData.append("main_business_goal", businessGoals.join(", "));
      formData.append("biggest_problem", biggestProblem.trim());
      formData.append("improvement_focus", improvementGoal.trim());
      appendImageFile(formData, "profile_image", profilePhoto);
      appendImageFile(formData, "interior_photo", interiorPhoto);
      appendImageFile(formData, "exterior_photo", exteriorPhoto);

      await apiClient.post("/api/v1/onboarding/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        transformRequest: (data) => data,
      });

      const [user, profileResponse] = await Promise.all([
        getCurrentUser(),
        apiClient.get("/api/v1/restaurant/settings/profile"),
      ]);
      setUser(user, tokens);
      setProfile(profileResponse.data);
      showSuccessMessage("Onboarding saved successfully.");
      router.replace("/(tabs)/home" as any);
    } catch (error: any) {
      console.error("Error saving onboarding:", error?.response?.data || error?.message);
      showErrorMessage(getApiErrorMessage(error, "Could not save onboarding details."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 9) {
      void submitOnboarding();
      return;
    }
    if (step < 10) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const renderFeatureStep = (screenIndex: number) => {
    const screen = featureScreens[screenIndex] || FALLBACK_FEATURE_SCREENS[screenIndex];
    const fallbackCopy = FALLBACK_FEATURE_COPY[screen.key];
    return (
      <StepFeatureExplanation
        icon={(screen.icon || FALLBACK_FEATURE_SCREENS[screenIndex].icon) as any}
        title={screen.title || undefined}
        description={screen.description || undefined}
        points={screen.points && screen.points.length > 0 ? screen.points : undefined}
        titleKey={fallbackCopy?.titleKey}
        descriptionKey={fallbackCopy?.descriptionKey}
        pointKeys={fallbackCopy?.pointKeys}
        onNext={handleNext}
        isLast={screenIndex === 3}
        loading={screenIndex === 3 && submitting}
      />
    );
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBarSegment,
              index < step ? styles.progressBarActive : null,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerTopArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            {step > 1 ? (
              <Feather name="arrow-left" size={moderateScale(24)} color="#111827" />
            ) : (
              <View style={styles.placeholderCircle} />
            )}
          </TouchableOpacity>

          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTextDark}>Risto </Text>
            <Text style={styles.logoTextOrange}>AI</Text>
          </View>

          <TouchableOpacity
            style={styles.langSelector}
            onPress={() => setIsLangMenuOpen(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.langText}>{appLanguage === "it" ? "Ita" : "Eng"}</Text>
            <Feather name="chevron-down" size={moderateScale(15)} color="#4B5563" />
          </TouchableOpacity>
        </View>
        {step < 10 && renderProgressBar()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {renderHeader()}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            pointerEvents={loadingInitialData || submitting ? "none" : "auto"}
          >
            {!loadingInitialData && step === 1 && (
              <Step1RestaurantInfo
                profilePhoto={profilePhoto}
                setProfilePhoto={setProfilePhoto}
                restaurantName={restaurantName}
                setRestaurantName={setRestaurantName}
                restaurantType={restaurantType}
                setRestaurantType={setRestaurantType}
                onNext={handleNext}
              />
            )}
            {!loadingInitialData && step === 2 && (
              <Step2RestaurantDetails
                city={city}
                setCity={setCity}
                seats={seats}
                setSeats={setSeats}
                averageSpend={averageSpend}
                setAverageSpend={setAverageSpend}
                onNext={handleNext}
              />
            )}
            {!loadingInitialData && step === 3 && (
              <Step3PhotoUpload
                interiorPhoto={interiorPhoto}
                setInteriorPhoto={setInteriorPhoto}
                exteriorPhoto={exteriorPhoto}
                setExteriorPhoto={setExteriorPhoto}
                onNext={handleNext}
              />
            )}
            {!loadingInitialData && step === 4 && (
              <Step4BusinessGoal
                businessGoals={businessGoals}
                setBusinessGoals={setBusinessGoals}
                onNext={handleNext}
              />
            )}
            {!loadingInitialData && step === 5 && (
              <Step5BiggestChallenge
                biggestProblem={biggestProblem}
                setBiggestProblem={setBiggestProblem}
                improvementGoal={improvementGoal}
                setImprovementGoal={setImprovementGoal}
                onNext={handleNext}
              />
            )}
            {!loadingInitialData && step === 6 && (
              renderFeatureStep(0)
            )}
            {!loadingInitialData && step === 7 && (
              renderFeatureStep(1)
            )}
            {!loadingInitialData && step === 8 && (
              renderFeatureStep(2)
            )}
            {!loadingInitialData && step === 9 && (
              renderFeatureStep(3)
            )}
            {!loadingInitialData && step === 10 && (
              <Step6Success />
            )}
          </ScrollView>
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
        {loadingInitialData || submitting ? (
          <View style={styles.loadingOverlay} pointerEvents="auto">
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FA8C4C" />
              <Text style={styles.loadingText}>
                {loadingInitialData ? "Loading setup..." : "Saving setup..."}
              </Text>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: scale(180),
    paddingHorizontal: scale(20),
  },
  loadingText: {
    marginTop: verticalScale(14),
    fontSize: moderateScale(20, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerTopArea: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: "center",
    alignItems: "flex-start",
  },
  placeholderCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#F9FAFB",
  },
  logoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextDark: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  logoTextOrange: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: "800",
    color: "#D97706",
  },
  langSelector: {
    minWidth: scale(64),
    height: moderateScale(36),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0E5",
    paddingHorizontal: scale(10),
    borderRadius: scale(18),
  },
  langText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginRight: scale(2),
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(10),
  },
  progressBarSegment: {
    height: moderateScale(4),
    width: scale(24),
    backgroundColor: "#FFEDD5",
    borderRadius: moderateScale(2),
  },
  progressBarActive: {
    backgroundColor: "#FA8C4C",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(40),
  },
});
