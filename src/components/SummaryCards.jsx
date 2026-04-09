// ─────────────────────────────────────────────────────────────
//  SummaryCards.jsx
//  Shows Total, Highest category, and number of transactions
// ─────────────────────────────────────────────────────────────
import { CATEGORY_COLORS } from "../pages/Dashboard";
import styles from "./SummaryCards.module.css";

export default function SummaryCards({ expenses, total }) {
  // Find which category has the most spending this month
  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className={styles.grid}>

      <div className={styles.card}>
        <p className={styles.label}>Total this month</p>
        <p className={styles.value}>₹{total.toFixed(2)}</p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Transactions</p>
        <p className={styles.value}>{expenses.length}</p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Highest category</p>
        {topCategory ? (
          <p className={styles.value} style={{ color: CATEGORY_COLORS[topCategory[0]] }}>
            {topCategory[0]}
            <span className={styles.catAmt}> ₹{topCategory[1].toFixed(0)}</span>
          </p>
        ) : (
          <p className={styles.value} style={{ color: "#ccc" }}>—</p>
        )}
      </div>

      <div className={styles.card}>
        <p className={styles.label}>Avg per transaction</p>
        <p className={styles.value}>
          {expenses.length ? `₹${(total / expenses.length).toFixed(0)}` : "—"}
        </p>
      </div>

    </div>
  );
}
