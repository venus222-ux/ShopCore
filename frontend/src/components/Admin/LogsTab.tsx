import React from "react";
import { useAdminStore } from "../../store/useAdminStore";
import logStyles from "../../styles/LogsTab.module.css";

import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  User,
  Database,
  Calendar,
  HardDrive,
} from "lucide-react";

const LogsTab: React.FC = () => {
  const {
    logs,
    paginationLogs,
    isLoadingLogs,
    currentPageLogs,
    setCurrentPageLogs,
    deleteLog,
  } = useAdminStore();

  const handleLogsPageChange = (newPage: number) => {
    if (!paginationLogs || newPage < 1 || newPage > paginationLogs.last_page)
      return;
    setCurrentPageLogs(newPage);
  };

  const getMimeClass = (mime?: string) => {
    if (!mime) return logStyles.mimeDefault;
    if (mime.includes("image")) return logStyles.mimeImage;
    if (mime.includes("pdf")) return logStyles.mimePdf;
    if (mime.includes("zip") || mime.includes("rar")) return logStyles.mimeZip;
    return logStyles.mimeDefault;
  };

  return (
    <div className={logStyles.tabContainer}>
      <main className={logStyles.mainContent}>
        <div className={logStyles.glassCard}>
          <header className={logStyles.cardHeader}>
            <div className={logStyles.headerTitle}>
              <h2>Activity Logs</h2>
              <span className={logStyles.countBadge}>
                {paginationLogs?.total || 0} Events
              </span>
            </div>
            {/* You could add a search bar here later */}
          </header>

          <div className={logStyles.tableContainer}>
            {isLoadingLogs ? (
              <div className={logStyles.loader}>
                <div className={logStyles.spinner}></div>
                <p>Syncing logs...</p>
              </div>
            ) : (
              <table className={logStyles.table}>
                <thead>
                  <tr>
                    <th>Event Details</th>
                    <th>Asset Info</th>
                    <th>Size</th>
                    <th>Format</th>
                    <th>Origin</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={logStyles.emptyState}>
                        <Database size={48} strokeWidth={1} />
                        <p>No activity recorded yet.</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id ?? `${log.created_at}-${log.file_name}`}>
                        <td className={logStyles.dateTimeCell}>
                          <Calendar size={14} />
                          <div>
                            <div className={logStyles.primaryText}>
                              {new Date(log.created_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                            <div className={logStyles.secondaryText}>
                              {new Date(log.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className={logStyles.fileInfo}>
                            <div className={logStyles.fileIconWrapper}>
                              <FileText size={18} />
                            </div>
                            <div>
                              <div className={logStyles.fileName}>
                                {log.file_name}
                              </div>
                              <div className={logStyles.productId}>
                                ID: {log.product_id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className={logStyles.sizeCell}>
                          {(log.size / (1024 * 1024)).toFixed(2)}{" "}
                          <span>MB</span>
                        </td>

                        <td>
                          <span
                            className={`${logStyles.mimeBadge} ${getMimeClass(log.mime)}`}
                          >
                            {log.mime?.split("/")[1] || "File"}
                          </span>
                        </td>

                        <td>
                          <div className={logStyles.originGroup}>
                            <div className={logStyles.originItem}>
                              <Globe size={12} /> {log.ip}
                            </div>
                            <div className={logStyles.originItem}>
                              <User size={12} /> {log.uploaded_by}
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => deleteLog(log._id!)}
                            className={logStyles.deleteAction}
                            title="Delete log entry"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {paginationLogs && paginationLogs.last_page > 1 && (
            <footer className={logStyles.pagination}>
              <button
                className={logStyles.pageBtn}
                disabled={currentPageLogs === 1}
                onClick={() => handleLogsPageChange(currentPageLogs - 1)}
              >
                <ChevronLeft size={20} />
              </button>

              <span className={logStyles.pageIndicator}>
                Page <strong>{currentPageLogs}</strong> of{" "}
                {paginationLogs.last_page}
              </span>

              <button
                className={logStyles.pageBtn}
                disabled={currentPageLogs === paginationLogs.last_page}
                onClick={() => handleLogsPageChange(currentPageLogs + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </footer>
          )}
        </div>
      </main>

      <aside className={logStyles.sidebar}>
        <div className={logStyles.glassCard}>
          <div className={logStyles.sidebarHeader}>
            <HardDrive size={20} />
            <h3>Storage Insight</h3>
          </div>

          <div className={logStyles.statsGrid}>
            <div className={logStyles.statBox}>
              <label>Total Logs</label>
              <div className={logStyles.statValue}>
                {paginationLogs?.total || 0}
              </div>
            </div>
            <div className={logStyles.statBox}>
              <label>Showing</label>
              <div className={logStyles.statValue}>{logs.length}</div>
            </div>
          </div>

          <div className={logStyles.sidebarFooter}>
            <p>System is monitoring all incoming file uploads in real-time.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LogsTab;
