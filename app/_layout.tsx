import React from "react";
import { Platform, View } from "react-native";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { AuthProvider } from "../src/context/AuthProvider";

const queryClient = new QueryClient();

// CSS global SOLO en web
if (Platform.OS === "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("./global.css");
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <View style={{ flex: 1, backgroundColor: "#0B1220" }}>
              <Header />
              <View style={{ flex: 1 }}>
                <Slot />
              </View>
              <Footer />
            </View>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
