import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthProvider";   // usa alias si ya lo configuraste

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: Platform.OS === "web" ? "#0B1220" : "#0B1220",
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        {/* Logo / Home */}
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
            Embipos
          </Text>
        </TouchableOpacity>

        {/* Iconos lado derecho */}
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          {user?.role === "leader" && (
            <TouchableOpacity onPress={() => router.push("/leader/dashboard")}>
              <Feather name="bar-chart-2" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Ícono de usuario → login si no hay sesión, profile si la hay */}
          <TouchableOpacity
            onPress={() => {
              if (user) router.push("/profile");
              else router.push("/login");
            }}
          >
            <Feather
              name={user ? "user" : "log-in"} // cambia el ícono si quieres
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
