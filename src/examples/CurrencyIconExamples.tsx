import { Input, Button, Tag } from "antd";
import { CurrencyIcon } from "../utils/currency";

/**
 * CurrencyIcon Size Reference Examples
 * This component displays all usage examples for the CurrencyIcon component
 * Copy-paste করে ব্যবহার করুন
 */

export const CurrencyIconExamples = () => {
  // Example data
  const amount = "1,250";
  const total = "5,000";
  const price = "250";
  const revenue = "125,000";
  const dailySales = "15,000";
  const monthlySales = "450,000";
  const value = "99";

  return (
    <div className="p-8 space-y-8">
      {/* ===================================== */}
      {/* 1. TABLE CELLS */}
      {/* ===================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">1. Table Cells</h2>

        {/* Small amounts (Subtotal, Delivery, etc.) */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Small amounts:</p>
          <span className="flex items-center gap-1">
            <CurrencyIcon size={12} className="text-gray-600" />
            {amount}
          </span>
        </div>

        {/* Important amounts (Total, Grand Total) */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Important amounts:</p>
          <span className="font-bold flex items-center gap-1">
            <CurrencyIcon size={14} className="text-green-600" />
            {total}
          </span>
        </div>
      </section>

      {/* ===================================== */}
      {/* 2. CARDS */}
      {/* ===================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">2. Cards</h2>

        {/* Card Small Text */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Card Small Text:</p>
          <div className="text-sm flex items-center gap-1">
            <CurrencyIcon size={11} />
            {price}
          </div>
        </div>

        {/* Card Medium (Primary Info) */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Card Medium:</p>
          <div className="text-base font-semibold flex items-center gap-1.5">
            <CurrencyIcon size={15} />
            {amount}
          </div>
        </div>

        {/* Card Large (Hero) */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Card Large:</p>
          <div className="text-2xl font-bold flex items-center gap-2">
            <CurrencyIcon size={18} className="text-primary" />
            {revenue}
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* 3. DASHBOARD METRICS */}
      {/* ===================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">3. Dashboard Metrics</h2>

        {/* Small Metric */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Small Metric:</p>
          <div className="flex items-center gap-1.5">
            <CurrencyIcon size={16} className="text-blue-600" />
            <span className="text-xl">{dailySales}</span>
          </div>
        </div>

        {/* Large Metric */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Large Metric:</p>
          <div className="flex items-center gap-2">
            <CurrencyIcon size={22} className="text-green-600" />
            <span className="text-3xl font-bold">{monthlySales}</span>
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* 4. FORMS & INPUTS */}
      {/* ===================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">4. Forms & Inputs</h2>

        {/* Input Prefix */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Input Prefix:</p>
          <Input
            prefix={<CurrencyIcon size={12} className="text-gray-400" />}
            value={price}
            style={{ maxWidth: 200 }}
          />
        </div>

        {/* Label */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Label:</p>
          <label className="flex items-center gap-1 text-sm font-medium">
            <CurrencyIcon size={11} />
            Amount
          </label>
        </div>
      </section>

      {/* ===================================== */}
      {/* 5. BUTTONS */}
      {/* ===================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">5. Buttons</h2>

        {/* Button Icon */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Button Icon:</p>
          <Button icon={<CurrencyIcon size={14} />}>Add Payment</Button>
        </div>
      </section>

      {/* ===================================== */}
      {/* 6. BADGES/TAGS */}
      {/* ===================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">6. Badges/Tags</h2>

        {/* Small Badge */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Small Badge:</p>
          <Tag className="flex items-center gap-1">
            <CurrencyIcon size={10} />
            {value}
          </Tag>
        </div>
      </section>

      {/* ===================================== */}
      {/* SIZE QUICK REFERENCE */}
      {/* ===================================== */}
      <section className="border-t pt-4">
        <h2 className="text-xl font-bold mb-4">Size Quick Reference</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {`size={10-11}  → Very small (tags, footnotes)
size={12-13}  → Small (table cells, body text)
size={14-15}  → Medium (emphasis, totals)
size={16-18}  → Large (headings, primary info)
size={20-24}  → Very large (hero, main metrics)`}
        </pre>
      </section>
    </div>
  );
};

export default CurrencyIconExamples;
