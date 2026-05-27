import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import AllCards from "./pages/AllCards";
import Collection from "./pages/Collection";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/all-cards",
      element: <AllCards />,
    },
    {
      path: "/upload-collection",
      element: <Collection />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
