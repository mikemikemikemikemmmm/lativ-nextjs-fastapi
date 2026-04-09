import SubCategoryPage, { SubCategoryLoader } from "@/app/category";
import NavIndexPage, { NavIndexLoader } from "@/app/home";
import RootLayout, { NavHeaderLoader } from "@/app/rootLayout";
import { NotFoundUI } from "@/app/notFound";
import IndexPage from "@/app/indexPage"
import ProductPage, { ProductPageLoader } from "@/app/product";
import { createBrowserRouter } from "react-router";
export const routeData = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: NotFoundUI,
    loader: NavHeaderLoader,
    children: [
      { index: true, Component: IndexPage },
      {
        path: "/category/:nav_route/:category_route/:sub_category_route",
        Component: SubCategoryPage,
        loader: SubCategoryLoader
      },
      {
        path: "/home/:nav_route",
        Component: NavIndexPage,
        loader: NavIndexLoader
      },
      {
        path: "/product/:product_id",
        Component: ProductPage,
        loader: ProductPageLoader
      }
    ],
  },
]);