import LoginPage from "../pages/AccountPage/Login";
import ForgotPasswordPage from "../pages/AccountPage/ForgotPassword";
import ResetPasswordPage from "../pages/AccountPage/ResetPassword";
import ProfilePage from "../pages/AccountPage/Profile";
import EditProfilePage from "../pages/AccountPage/EditProfile";
import ChangePasswordPage from "../pages/AccountPage/ChangePassword";
import AdminLayout from "../pages/AdminPage/AdminLayout";
// Keep individual imports for potential standalone use
import UserManagement from "../pages/AdminPage/UserManagement";
import RoleManagement from "../pages/AdminPage/RoleManagement";
import AdminDashboard from "../pages/AdminPage/AdminDashboard";
import SystemSettings from "../pages/AdminPage/SystemSettings";
import AdminReports from "../pages/AdminPage/AdminReports";

export const routes = [
  {
    path: "/",
    name: "Login",
    page: LoginPage,
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
    path: "/forgot-password",
    name: "Forgot Password",
    page: ForgotPasswordPage,
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
  {
    path: "/profile",
    name: "Profile",
    page: ProfilePage,
    isShowHeader: true,
    requiredPermissions: 1,
  },
  {
    path: "/profile/edit",
    name: "Edit Profile",
    page: EditProfilePage,
    isShowHeader: true,
    requiredPermissions: 1,
  },
  {
    path: "/profile/change-password",
    name: "Change Password",
    page: ChangePasswordPage,
    isShowHeader: true,
    requiredPermissions: 1,
  },
  {
    path: "/admin",
    name: "Admin Panel",
    page: AdminLayout,
    isShowHeader: false, // AdminLayout has its own header
    requiredPermissions: 2, // Admin only
  },
  // Keep individual admin routes for direct access if needed
  {
    path: "/admin/users",
    name: "User Management",
    page: UserManagement,
    isShowHeader: true,
    requiredPermissions: 2, // Admin only
  },
  {
    path: "/admin/roles",
    name: "Role Management",
    page: RoleManagement,
    isShowHeader: true,
    requiredPermissions: 2, // Admin only
  },
  {
    path: "/admin/dashboard",
    name: "Bảng điều khiển quản trị",
    page: AdminDashboard,
    isShowHeader: true,
    requiredPermissions: 2, // Admin only
  },
  {
    path: "/admin/settings",
    name: "System Settings",
    page: SystemSettings,
    isShowHeader: true,
    requiredPermissions: 2, // Admin only
  },
  {
    path: "/admin/reports",
    name: "Admin Reports",
    page: AdminReports,
    isShowHeader: true,
    requiredPermissions: 2, // Admin only
  },
];
