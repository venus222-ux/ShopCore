// src/hooks/useSettings.ts

import { useEffect } from "react";
import API from "../api";
import { useSettingsStore } from "../store/useSettingsStore";

export function useSettings() {
  const setVatPercent = useSettingsStore(
    (state) => state.setVatPercent,
  );

  useEffect(() => {
    API.get("/settings")
      .then((res) => {
        setVatPercent(res.data.vat_percent);
      })
      .catch(console.error);
  }, []);
}