import { ScrollView, View, Text } from "react-native";
import GoalsCard from "@/features/goals/GoalsCard";
import ProductTable from "@/features/products/ProductTable";
import ReportExportButton from "@/features/reports/ReportExportButton";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LeaderDashboardScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "leader" && user?.role !== "admin") {
      router.replace("/"); // o /productos
    }
  }, [user, loading]);

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <View style={{ gap:16 }}>
        <Text style={{ color:"#fff", fontSize:20, fontWeight:"700" }}>Dashboard</Text>

        <View style={{ flexDirection:"row", gap:16, flexWrap:"wrap" }}>
          <View style={{ flex:1, minWidth:320 }}>
            <GoalsCard />
          </View>
          <View style={{ flex:1, minWidth:320 }}>
            <ReportExportButton />
          </View>
        </View>

        <View style={{ backgroundColor:"#0f172a", borderRadius:12, padding:16 }}>
          <Text style={{ color:"#fff", fontSize:16, fontWeight:"600", marginBottom:8 }}>Productos</Text>
          <ProductTable />
        </View>
      </View>
    </ScrollView>
  );
}
