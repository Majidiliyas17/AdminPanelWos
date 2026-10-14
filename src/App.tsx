import { BrowserRouter } from "react-router-dom";
import { AdminAuthProvider } from "@/lib/auth";
import { AppRoutes } from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
