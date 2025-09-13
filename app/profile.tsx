import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../src/context/AuthProvider";


export default function Profile() {
const { user, signOut } = useAuth();
return (
<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
<Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>{user?.name}</Text>
<Text style={{ color: "#9AA4B2", marginBottom: 16 }}>{user?.email} • {user?.role}</Text>
<TouchableOpacity onPress={signOut} style={{ backgroundColor: "#EF4444", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
<Text style={{ color: "white", fontWeight: "700" }}>Cerrar sesión</Text>
</TouchableOpacity>
</View>
);
}