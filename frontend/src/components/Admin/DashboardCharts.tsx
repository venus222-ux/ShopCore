// src/components/Dashboard/DashboardCharts.tsx
import React, { useMemo } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import styles from "../../styles/AdminDashboard.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  stats: any;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  // We keep this guard clause to prevent hooks from running on empty data,
  // but we ensure the logic is safely encapsulated inside useMemo calls below.
  if (!stats) return <p>Loading charts...</p>;

  // ================= SALES =================
  const lineChartData = useMemo(() => {
    const sales = stats?.charts?.sales ?? [];
    const labels = sales.map((s: any) => s.date);
    const revenue = sales.map((s: any) => Number(s.revenue || 0));
    const orders = sales.map((s: any) => Number(s.orders || 0));

    return {
      labels,
      datasets: [
        {
          label: "Revenue ($)",
          data: revenue,
          borderColor: "rgba(99, 102, 241, 1)",
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          yAxisID: "y",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Orders",
          data: orders,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          yAxisID: "y1",
          tension: 0.3,
        },
      ],
    };
  }, [stats?.charts?.sales]); // Depend on the specific property

  // ================= TRAFFIC (SOURCE) =================
  const trafficChartData = useMemo(() => {
    const traffic = stats?.charts?.traffic ?? [];
    const labels = traffic.map((t: any) => t.source);
    const data = traffic.map((t: any) => Number(t.value || 0));

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"],
          borderWidth: 0,
        },
      ],
    };
  }, [stats?.charts?.traffic]);

  // ================= BROWSER ANALYTICS =================
  const browserChartData = useMemo(() => {
    const browsers = stats?.charts?.traffic_browser ?? [];
    const labels = browsers.map((b: any) => b.source);
    const data = browsers.map((b: any) => Number(b.value || 0));

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#14b8a6"],
          borderWidth: 0,
        },
      ],
    };
  }, [stats?.charts?.traffic_browser]);

  // ================= DEVICE ANALYTICS =================
  const deviceChartData = useMemo(() => {
    const devices = stats?.charts?.traffic_device ?? [];
    const labels = devices.map((d: any) => d.source);
    const data = devices.map((d: any) => Number(d.value || 0));

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
          borderWidth: 0,
        },
      ],
    };
  }, [stats?.charts?.traffic_device]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      y: { type: "linear" as const, display: true, position: "left" as const },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className={styles.chartsGrid} style={{ display: "grid", gap: "24px" }}>
      <div className={styles.glassCard} style={{ padding: "20px" }}>
        <h3>Sales & Orders (Last 30 Days)</h3>
        <div style={{ height: "300px" }}>
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>

      <div className={styles.glassCard} style={{ padding: "20px" }}>
        <h3>Traffic Sources</h3>
        <div style={{ height: "300px" }}>
          <Doughnut data={trafficChartData} />
        </div>
      </div>

      <div className={styles.glassCard} style={{ padding: "20px" }}>
        <h3>Browser Usage</h3>
        <div style={{ height: "300px" }}>
          <Doughnut data={browserChartData} />
        </div>
      </div>

      <div className={styles.glassCard} style={{ padding: "20px" }}>
        <h3>Device Usage</h3>
        <div style={{ height: "300px" }}>
          <Doughnut data={deviceChartData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;