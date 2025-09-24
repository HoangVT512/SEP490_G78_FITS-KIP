import LoginPage from "../pages/AccountPage/CompactLogin";
import ResetPasswordPage from "../pages/AccountPage/ResetPassword";
import DashboardPage from "../pages/DashboardPage";

export const routes = [
  {
    path: "/",
    name: "Home",
    page: DashboardPage,
    isShowHeader: true,
    requiredPermissions: 0,
  },
  {
    path: "/login",
    name: "Login",
    page: LoginPage,
    isShowHeader: true,
    requiredPermissions: 0,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    page: DashboardPage,
    isShowHeader: true,
    requiredPermissions: 0,
  },
  {
    path: "/reset-password",
    name: "Reset Password",
    page: ResetPasswordPage,
    isShowHeader: true,
    requiredPermissions: 0,
  },
];
