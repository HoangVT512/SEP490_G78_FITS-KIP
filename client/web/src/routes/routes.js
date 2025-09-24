import LoginPage from "../pages/AccountPage/Login";

export const routes = [
  {
    path: "/login",
    name: "Login",
    page: LoginPage,
    isShowHeader: false,
    requiredPermissions: 0,
  },
];
