import { Stack } from "expo-router";
import { useProtectedRoute } from "../../src/hooks/useProtectedRoute";


export default function AuthLayout() {
// Usuarios autenticados NO deben ver el login
useProtectedRoute();
return (
<Stack screenOptions={{ headerShown: false }} />
);
}