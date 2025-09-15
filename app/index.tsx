// app/index.tsx
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useAuth } from "../src/context/AuthProvider";

export default function Index() {
  const { user, init, loading } = useAuth() as any;

  // Si tienes un init() que hidrata desde el token, lánzalo al montar
  useEffect(() => { init?.(); }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/auth/login" />;

  return (
    <Redirect
      href={
        user.role === "admin" || user.role === "leader"
          ? "/leader/dashboard"
          : "/venta"
      }
    />
  );
}
