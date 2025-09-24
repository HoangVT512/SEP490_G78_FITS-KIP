import LoginPage from "../pages/AccountPage/CompactLogin";
import ResetPasswordPage from "../pages/AccountPage/ResetPassword";
import ProfilePage from "../pages/AccountPage/Profile";
import EditProfilePage from "../pages/AccountPage/EditProfile";
import ChangePasswordPage from "../pages/AccountPage/ChangePassword";
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
];
