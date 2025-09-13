import { View, Text } from "react-native";
import { useProtectedRoute } from "../hooks/useProtectedRoute";


export default function LeaderDashboard() {
useProtectedRoute("leader");
return (
<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
<Text style={{ color: "white", fontSize: 22, fontWeight: "700" }}>Panel de Líder</Text>
<Text style={{ color: "#9AA4B2", marginTop: 8 }}>Acceso restringido por rol</Text>
</View>
);
}