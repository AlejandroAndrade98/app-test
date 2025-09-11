import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, StyleSheet, Platform } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Layout() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerShown: false,            // el header superior lo ponemos en cada pantalla si hace falta
            tabBarShowLabel: true,
            // sceneContainerStyle: { backgroundColor: "#0B1220" },
            tabBarActiveTintColor: theme.active,
            tabBarInactiveTintColor: theme.inactive,
            tabBarStyle: [
              styles.tabbar,
              {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
                shadowColor: theme.shadow,
              },
            ],
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
          }}
          >
          <Tabs.Screen
          name="index"
          options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
          <Feather name="home" size={size} color={color} />
          ),
          }}
          />
          <Tabs.Screen
            name="venta"
            options={{
              title: "Venta",
              tabBarIcon: ({ color, size }) => (
                <Feather name="shopping-cart" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="productos"
            options={{
              title: "Productos",
              tabBarIcon: ({ color, size }) => (
                <Feather name="grid" size={size} color={color} />
              ),
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/* ----------------------------- theme ---------------------------- */
const lightTheme = {
  card: "#FFFFFF",
  border: "#E6E8EC",
  shadow: "#000",
  active: "#2563EB",
  inactive: "#7C8AA0",
};

const darkTheme = {
  card: "#121A2A",
  border: "#1F2A44",
  shadow: "#000",
  active: "#60A5FA",
  inactive: "#9CA3AF",
};

/* ---------------------------- styles ---------------------------- */
const styles = StyleSheet.create({
  tabbar: {
    height: 64,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 16, android: 12 }),
    borderTopWidth: StyleSheet.hairlineWidth,
    // look elevado y con bordes suaves:
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
});
