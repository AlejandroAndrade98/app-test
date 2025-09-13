import { View, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function Footer() {
const insets = useSafeAreaInsets();
return (
<View style={{ backgroundColor: Platform.OS === "web" ? "#0B1220" : "#0B1220" }}>
<View style={{ height: 44, alignItems: "center", justifyContent: "center" }}>
<Text style={{ color: "#9AA4B2", fontSize: 12 }}>© {new Date().getFullYear()} Embipos • v0.1</Text>
</View>
<View style={{ height: insets.bottom }} />
</View>
);
}