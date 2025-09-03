import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Tabs screenOptions={{ lazy: true }}>
      <Tabs.Screen name="venta" options={{ title: "Venta" }} />
      <Tabs.Screen name="productos" options={{ title: "Productos" }} />
      <Tabs.Screen name="reportes" options={{ title: "Reporte diario" }} />
      <Tabs.Screen name="reportes-range" options={{ title: "Reporte por rango" }} />
    </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
