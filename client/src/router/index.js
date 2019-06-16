import LoginPage from "@/components/LoginPage";
import VariationDetails from "@/components/VariationDetails";

export const routes = [
  {
    path: "/",
    name: "LoginPage",
    component: LoginPage
  },
  {
    path: "/variation",
    component: VariationDetails
  }
];
