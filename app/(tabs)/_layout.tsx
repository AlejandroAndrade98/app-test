// app/(tabs)/_layout.tsx
import { useEffect } from "react";
import { Tabs } from "expo-router";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet, Platform, useColorScheme } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Layout() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  // // 🔧 Parche inmediato para Web: inyecta CSS global para apagar el “blanco”
  // useEffect(() => {
  //   if (Platform.OS !== "web") return;
  //   const style = document.createElement("style");
  //   style.setAttribute("data-embipos", "fix-tabs-bg");
  //   style.innerHTML = `
  //     html, body, #root { height: 100%; background: #0B1220; }
  //     #root > div, #root > div > div { min-height: 100%; background: #0B1220; }
  //     *[style*="background-color: rgb(242, 242, 242)"],
  //     *[style*="background-color: rgb(216, 216, 216)"],
  //     *[style*="background: rgb(242, 242, 242)"],
  //     *[style*="background: rgb(216, 216, 216)"] {
  //       background-color: #0B1220 !important; background: #0B1220 !important;
  //     }
  //     *:where([style*="position: fixed"][style*="bottom: 0"]) {
  //       background: transparent !important; box-shadow: none !important;
  //     }
  //     [role="tablist"], [role="tablist"] * { background: transparent !important; }
  //     *[style*="box-shadow"][style*="-2px"] { background: transparent !important; box-shadow: none !important; }
  //   `;
  //   document.head.appendChild(style);
  //   return () => style.remove();
  // }, []);

  const baseOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarShowLabel: true,
    sceneContainerStyle: { backgroundColor: "#0B1220" },
    safeAreaInsets: { bottom: 0 },
    tabBarActiveTintColor: theme.active,
    tabBarInactiveTintColor: theme.inactive,
    tabBarStyle: [
      styles.tabbar,
      {
        // 👇 en Web queremos transparente para que se vea el fondo oscuro
        backgroundColor: "transparent",
        borderTopColor: theme.border,
        shadowColor: "transparent",
      },
    ],
    tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
    // 👇 también transparente
    tabBarBackground: () => <View style={{ flex: 1, backgroundColor: "transparent" }} />,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0B1220" }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#0B1220" }}>
          <Tabs screenOptions={baseOptions}>
            <Tabs.Screen
              name="index"
              options={{
                title: "Inicio",
                tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="venta"
              options={{
                title: "Venta",
                tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="productos"
              options={{
                title: "Productos",
                tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="reportes"
              options={{
                title: "Reporte diario",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="reportes-range"
              options={{
                title: "Reporte por rango",
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="chart-timeline-variant" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const lightTheme = { card: "#FFFFFF", border: "#E6E8EC", shadow: "#000", active: "#2563EB", inactive: "#7C8AA0" };
const darkTheme  = { card: "#121A2A", border: "#1F2A44", shadow: "#000", active: "#60A5FA", inactive: "#9CA3AF" };

const styles = StyleSheet.create({
  tabbar: {
    height: 64,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
});
