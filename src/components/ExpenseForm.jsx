// ─────────────────────────────────────────────────────────────
//  ExpenseForm.jsx
//  Controlled form: title, amount, category, date
//  Calls onAdd() from Dashboard when submitted
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { CATEGORIES } from "../pages/Dashboard";
import styles from "./ExpenseForm.module.css";

const today = () => new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const EMPTY = { title: "", amount: "", category: "Food", date: today() };

export default function ExpenseForm({ onAdd }) {
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop page reload

    // Basic validation
    if (!form.title.trim())     return setError("Title is required.");
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0)
                                return setError("Enter a valid amount.");
    if (!form.date)             return setError("Date is required.");

    setLoading(true);
    await onAdd(form);         // write to Firestore (in Dashboard)
    setForm(EMPTY);            // reset form
    setLoading(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Zomato order"
          className={styles.input}
          maxLength={60}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Amount (₹)</label>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            className={styles.input}
            min="0"
            step="0.01"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Category</label>
        <select name="category" value={form.category} onChange={handleChange} className={styles.select}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} className={styles.btn}>
        {loading ? "Adding…" : "+ Add Expense"}
      </button>

    </form>
  );
}
