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
import { getCurrentUser } from "../../api/auth";
import Step1RestaurantInfo from "../../components/auth/restoAi/Step1RestaurantInfo";
import Step2RestaurantDetails from "../../components/auth/restoAi/Step2RestaurantDetails";
import Step3PhotoUpload from "../../components/auth/restoAi/Step3PhotoUpload";
import Step4BusinessGoal from "../../components/auth/restoAi/Step4BusinessGoal";
import Step5BiggestChallenge from "../../components/auth/restoAi/Step5BiggestChallenge";
import Step6Success from "../../components/auth/restoAi/Step6Success";
import { useAppStore } from "../../store/useAppStore";
import { buildFileName, inferMimeType } from "../../utils/fileMetadata";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";

type OnboardingProfileResponse = {
  restaurant_name?: string | null;
  restaurant_type?: string | null;
  city_location?: string | null;
  number_of_seats?: number | null;
  average_spend_per_customer?: number | null;
  interior_photo_url?: string | null;
  exterior_photo_url?: string | null;
  main_business_goal?: string | null;
  biggest_problem?: string | null;
  improvement_focus?: string | null;
};

export default function SetupScreen() {
  const router = useRouter();
  const setProfile = useAppStore((state) => state.setProfile);
  const setUser = useAppStore((state) => state.setUser);
  const tokens = useAppStore((state) => state.tokens);
  const [step, setStep] = useState(1);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 State
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantType, setRestaurantType] = useState("");

  // Step 2 State
  const [city, setCity] = useState("");
  const [seats, setSeats] = useState("");
  const [averageSpend, setAverageSpend] = useState("");

  // Step 3 State
  const [interiorPhoto, setInteriorPhoto] = useState<string | null>(null);
  const [exteriorPhoto, setExteriorPhoto] = useState<string | null>(null);

  // Step 4 State
  const [businessGoal, setBusinessGoal] = useState("Increase revenue");

  // Step 5 State
  const [biggestProblem, setBiggestProblem] = useState("");
  const [improvementGoal, setImprovementGoal] = useState("");

  const totalSteps = 5;

  useEffect(() => {
    const loadSetupData = async () => {
      try {
        const [user, onboardingResponse] = await Promise.all([
          getCurrentUser(),
          apiClient.get<OnboardingProfileResponse | null>("/api/v1/onboarding/profile"),
        ]);
        const onboarding = onboardingResponse.data;

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
        setInteriorPhoto(onboarding?.interior_photo_url || null);
        setExteriorPhoto(onboarding?.exterior_photo_url || null);
        setBusinessGoal(onboarding?.main_business_goal || "Increase revenue");
        setBiggestProblem(onboarding?.biggest_problem || "");
        setImprovementGoal(onboarding?.improvement_focus || "");
      } catch (error: any) {
        console.error("Error loading onboarding data:", error?.response?.data || error?.message);
      } finally {
        setLoadingInitialData(false);
      }
    };

    void loadSetupData();
  }, []);

  const appendImageFile = (formData: FormData, fieldName: "interior_photo" | "exterior_photo", uri: string | null) => {
    if (!uri || /^https?:\/\//i.test(uri)) {
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
      formData.append("main_business_goal", businessGoal.trim());
      formData.append("biggest_problem", biggestProblem.trim());
      formData.append("improvement_focus", improvementGoal.trim());
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
      setStep(6);
      showSuccessMessage("Onboarding saved successfully.");
    } catch (error: any) {
      console.error("Error saving onboarding:", error?.response?.data || error?.message);
      showErrorMessage("Could not save onboarding details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 5) {
      void submitOnboarding();
      return;
    }
    if (step < 6) {
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

          <View style={{ width: moderateScale(40) }} />
        </View>
        {step < 6 && renderProgressBar()}
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
          {loadingInitialData ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#FA8C4C" />
            </View>
          ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {step === 1 && (
              <Step1RestaurantInfo
                restaurantName={restaurantName}
                setRestaurantName={setRestaurantName}
                restaurantType={restaurantType}
                setRestaurantType={setRestaurantType}
                onNext={handleNext}
              />
            )}
            {step === 2 && (
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
            {step === 3 && (
              <Step3PhotoUpload
                interiorPhoto={interiorPhoto}
                setInteriorPhoto={setInteriorPhoto}
                exteriorPhoto={exteriorPhoto}
                setExteriorPhoto={setExteriorPhoto}
                onNext={handleNext}
              />
            )}
            {step === 4 && (
              <Step4BusinessGoal
                businessGoal={businessGoal}
                setBusinessGoal={setBusinessGoal}
                onNext={handleNext}
              />
            )}
            {step === 5 && (
              <Step5BiggestChallenge
                biggestProblem={biggestProblem}
                setBiggestProblem={setBiggestProblem}
                improvementGoal={improvementGoal}
                setImprovementGoal={setImprovementGoal}
                onNext={submitting ? () => undefined : handleNext}
              />
            )}
            {step === 6 && (
              <Step6Success />
            )}
          </ScrollView>
          )}
        </View>
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
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(10),
  },
  progressBarSegment: {
    height: moderateScale(4),
    width: scale(30),
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
