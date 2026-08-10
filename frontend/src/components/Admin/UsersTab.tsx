import React from "react";
// Updated path to point to the new module file
import styles from "../../styles/UsersTab.module.css";

import type { Props } from "../../types";

const UsersTab: React.FC<Props> = ({ users, onDelete }) => {
  return (
    <div>
      {/* Targetted by .header, .header h2, and .subtitle */}
      <header className={styles.header}>
        <h2>User Management</h2>
        <p className={styles.subtitle}>
          View and manage registered system users.
        </p>
      </header>

      {/* Targetted by .tableWrapper and .tableHeader */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          Total Users: {users?.length || 0}
        </div>

        {/* Targetted by .adminTable and its nested selectors */}
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#718096",
                  }}
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email}</td>
                  {/* CSS :nth-child(3) handles the indigo color here */}
                  <td>{user.roles?.[0]?.name || "user"}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
