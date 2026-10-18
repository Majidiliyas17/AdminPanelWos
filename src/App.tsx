import { BrowserRouter } from "react-router-dom";
import { AdminAuthProvider } from "@/lib/auth";
import { AppRoutes } from "@/routes";
import { Toaster } from "@/lib/toast";

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
        <Toaster />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
