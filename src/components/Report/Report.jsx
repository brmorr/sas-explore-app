import React from "react";
import "./Report.css";
import config from "../../config.json";

export function Report({packageUri}) {
  return (
    <sas-report packageUri={packageUri}></sas-report>
  );
}
