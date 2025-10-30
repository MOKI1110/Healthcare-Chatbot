import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import "./utils/i18n"; // initializes i18n (react-i18next config)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
