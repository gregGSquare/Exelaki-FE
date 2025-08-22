import React, { useEffect } from "react";
import AppShell from "../layout/AppShell";
import WidgetGrid from "./WidgetGrid";
import { LayoutProvider } from "../state/LayoutContext";
import { useParams } from "react-router-dom";

const DashboardV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id) localStorage.setItem('lastBudgetId', id);
  }, [id]);
  return (
    <LayoutProvider>
      <AppShell>
        <WidgetGrid />
      </AppShell>
    </LayoutProvider>
  );
};

export default DashboardV2;


