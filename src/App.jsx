import React from "react";
import { Dashboard } from "./components/Dashboard";
import config from "./config.json";

function App() {
  return <Dashboard packageUri={`${process.env.PUBLIC_URL}/reportPackages/${config.REPORT_UID}`}></Dashboard>;
}

export default App;
