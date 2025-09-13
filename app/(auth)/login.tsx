import { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/context/AuthProvider";

export default function LoginScreen() {
  const { signIn  } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams(); // por si mandas ?from=/productos

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      const to = (params?.from as string) || "/productos";
      router.replace(to);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", color: "#fff" }}>Iniciar sesión</Text>

      <Text style={{ color: "#ccc" }}>Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ backgroundColor: "#111827", color: "#fff", padding: 10, borderRadius: 8 }}
      />

      <Text style={{ color: "#ccc" }}>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ backgroundColor: "#111827", color: "#fff", padding: 10, borderRadius: 8 }}
      />

      {error && <Text style={{ color: "tomato" }}>{error}</Text>}

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Entrar" onPress={onSubmit} />
      )}
    </View>
  );
}
