import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes/routes";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={<route.page showHeader={route.isShowHeader} />}
          />
        ))}
        {/* Show NotFoundPage for unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
