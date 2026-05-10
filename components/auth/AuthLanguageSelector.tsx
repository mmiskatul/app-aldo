import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import LanguageModal from "../home/LanguageModal";
import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../utils/i18n";

export default function AuthLanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const appLanguage = useAppStore((state) => state.appLanguage);
  const setAppLanguage = useAppStore((state) => state.setAppLanguage);
  const { t } = useTranslation();

  return (
    <>
      <TouchableOpacity
        style={styles.langSelector}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("change_language")}
      >
        <Text style={styles.langText}>{appLanguage === "it" ? "Ita" : "Eng"}</Text>
        <Feather name="chevron-down" size={moderateScale(15)} color="#4B5563" style={styles.chevron} />
      </TouchableOpacity>
      <LanguageModal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        selectedLang={appLanguage}
        onSelectLang={(lang) => {
          setAppLanguage(lang);
          setIsOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  langSelector: {
    alignSelf: "center",
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
  chevron: {
    marginLeft: scale(2),
  },
});
