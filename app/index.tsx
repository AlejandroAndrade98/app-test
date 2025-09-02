// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Si quieres que abra la pestaña Venta:
  return <Redirect href="/venta" />;

  // Si quieres que abra el index dentro de tabs:
  // return <Redirect href="/" />;
}