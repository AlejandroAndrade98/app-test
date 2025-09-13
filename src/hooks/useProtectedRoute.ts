import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../context/AuthProvider";


export function useProtectedRoute(required?: "auth" | "guest" | "leader") {
const { user, loading } = useAuth();
const segments = useSegments();
const router = useRouter();


useEffect(() => {
if (loading) return;


const inAuthGroup = segments[0] === "(auth)";


// 1) Si no hay usuario, fuerza al grupo (auth)
if (!user && !inAuthGroup) {
router.replace("/(auth)/login");
return;
}


// 2) Si hay usuario y está en (auth), redirige al home
if (user && inAuthGroup) {
router.replace("/(tabs)");
return;
}


// 3) Si piden rol leader y no lo es, mándalo al home
if (required === "leader" && user?.role !== "leader") {
router.replace("/(tabs)");
return;
}
}, [segments, user, loading, required]);
}