import SubCategoryPage, { SubCategoryLoader } from "@/app/category";
import NavIndexPage, { NavIndexLoader } from "@/app/home";
import RootLayout, { rootLoader } from "@/app/rootLayout";
import { NotFoundUI } from "@/app/notFound";
import IndexPage from "@/app/indexPage"
import ProductPage, { ProductPageLoader } from "@/app/product";
import { createBrowserRouter } from "react-router";
import CategoryAsideLayout from "@/app/categoryAsideLayout";
export const routeData = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    loader: rootLoader,
    ErrorBoundary: NotFoundUI,
    children: [
      { index: true, Component: IndexPage },
      {
        path: "category",
        Component: CategoryAsideLayout,
        children: [
          {
            path: ":nav_route/:category_route/:sub_category_route",
            Component: SubCategoryPage,
            loader: SubCategoryLoader
          },
        ],
      },
      {
        path: "home",
        Component: CategoryAsideLayout,
        children: [
          {
            path: ":nav_route",
            Component: NavIndexPage,
            loader: NavIndexLoader
          },
        ],
      },
      {
        path: "product",
        Component: CategoryAsideLayout,
        children: [
          {
            path: ":product_id",
            Component: ProductPage,
            loader: ProductPageLoader
          },
        ],
      }
    ],
  },
],{
  basename:"/lativ-nextjs-fastapi"
});