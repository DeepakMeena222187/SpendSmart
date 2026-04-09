// ─────────────────────────────────────────────────────────────
//  ExpenseList.jsx
//  Renders each expense as a row with a delete button.
//  Sorted by date descending (newest first).
// ─────────────────────────────────────────────────────────────
import { CATEGORY_COLORS } from "../pages/Dashboard";
import styles from "./ExpenseList.module.css";

export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className={styles.empty}>
        No expenses yet for this month. Add one above!
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {expenses.map((exp) => (
        <div key={exp.id} className={styles.row}>

          {/* Category colour dot */}
          <span
            className={styles.dot}
            style={{ background: CATEGORY_COLORS[exp.category] || "#aaa" }}
          />

          {/* Title + date */}
          <div className={styles.info}>
            <p className={styles.title}>{exp.title}</p>
            <p className={styles.meta}>
              {exp.category}  ·  {exp.date}
            </p>
          </div>

          {/* Amount */}
          <p className={styles.amount}>₹{exp.amount.toFixed(2)}</p>

          {/* Delete button */}
          <button
            className={styles.deleteBtn}
            onClick={() => {
              if (window.confirm(`Delete "${exp.title}"?`)) onDelete(exp.id);
            }}
            title="Delete"
          >
            ✕
          </button>

        </div>
      ))}
    </div>
  );
}
