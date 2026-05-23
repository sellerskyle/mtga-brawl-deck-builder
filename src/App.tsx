import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./Home";
import AllCards from "./AllCards";

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
  ]);

  return <RouterProvider router={router} />;
};

export default App;
