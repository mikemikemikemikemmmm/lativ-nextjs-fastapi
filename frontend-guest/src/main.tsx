import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { routeData } from "./route";
import { StrictMode } from "react";

const root = document.getElementById("root");
if (root) {
    ReactDOM.createRoot(root).render(
        <StrictMode>
            <RouterProvider router={routeData} />
        </StrictMode>
    );
}