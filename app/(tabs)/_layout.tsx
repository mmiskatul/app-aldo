import {
  Analytics01Icon,
  CheckListIcon,
  Comment01Icon,
  DocumentAttachmentIcon,
  Home07Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import * as HugeiconsModule from "@hugeicons/react-native";
import { Redirect, Tabs, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { getCurrentUser, hasCompletedOnboarding } from "../../api/auth";
import { getRestrictedAccessStatus, useAppStore } from "../../store/useAppStore";

const hugeiconsAny = HugeiconsModule as any;
const HugeiconsIcon = hugeiconsAny.HugeiconsIcon || hugeiconsAny.default?.HugeiconsIcon || hugeiconsAny;

export default function TabLayout() {
  const segments = useSegments();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const logout = useAppStore((state) => state.logout);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const isRestrictedAccess = getRestrictedAccessStatus(user) !== null;
  const currentLeaf = (segments as string[])[2];

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!tokens?.access_token) {
      setIsSessionChecking(false);
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) {
          return;
        }
        setUser(currentUser, tokens);
      } catch (error: any) {
        console.log(
          "[auth bootstrap] session invalid:",
          error?.response?.data || error?.message
        );
        if (!isMounted) {
          return;
        }
        logout();
      } finally {
        if (isMounted) {
          setIsSessionChecking(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [hasHydrated, logout, setUser, tokens]);

  if (!hasHydrated || isSessionChecking) {
    return null;
  }

  if (!user || !tokens?.access_token) {
    return <Redirect href="/(auth)" />;
  }

  if (isRestrictedAccess && currentLeaf !== "help-center" && currentLeaf !== "restricted-access") {
    return <Redirect href="/(tabs)/settings/restricted-access" />;
  }

  if (!hasCompletedOnboarding(user)) {
    return <Redirect href="/(auth)/setup" />;
  }
  
  // Conditionally hide tab bar on specific screens that are deep in stacks
  // Only show tab bar if we are on the exact root of a tab (e.g. ['(tabs)', 'home'] or ['(tabs)', 'home', 'index'])
  const isRootScreen = segments.length <= 2 || (segments.length === 3 && (segments as any[])[2] === 'index');
  const shouldHideTabBar = isRestrictedAccess || !isRootScreen;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FA8C4C", // Active color from mockup
        tabBarInactiveTintColor: "#6B7280",
        tabBarHideOnKeyboard: true,
        tabBarStyle: shouldHideTabBar ? { display: 'none', height: 0, opacity: 0 } : {
          position: "absolute", // Needed for border radii to sit above content seamlessly
          backgroundColor: "#FFF0E5", // Faint orange background from the mockup
          borderTopLeftRadius: scale(20),
          borderTopRightRadius: scale(20),
          height: verticalScale(60),
          paddingBottom: verticalScale(8),
          paddingTop: verticalScale(8),
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(10, 0.3),
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={Home07Icon}
              size={moderateScale(24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={Analytics01Icon}
              size={moderateScale(24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={CheckListIcon}
              size={moderateScale(24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          tabBarLabel: "Documents",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={DocumentAttachmentIcon}
              size={moderateScale(24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={Comment01Icon}
              size={moderateScale(24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon
              icon={Settings01Icon}
              size={moderateScale(24)}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
