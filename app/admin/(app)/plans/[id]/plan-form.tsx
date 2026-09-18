"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deletePlan, saveAndDeactivate, updatePlan } from "../actions";
import { centsToDollars } from "@/lib/money";
import ConfirmDelete from "../../confirm-delete";
import { PlusIcon, SaveIcon, TrashIcon } from "../../icons";

type Plan = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  priceCents: number;
  features: string[];
  active: boolean;
};

// Full-screen loading state shown while the plan saves AND syncs to Stripe.
function SavingOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="admin-loading-overlay" role="status" aria-live="polite">
      <div className="admin-spinner" aria-hidden />
      <p>Saving &amp; syncing with Stripe…</p>
    </div>
  );
}

// Save (default action = updatePlan) auto-activates a priced plan. Deactivate only
// shows when the plan is live; it submits the SAME form via formAction so it saves
// the current edits while hiding the plan.
function FormButtons({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" className="admin-btn" disabled={pending} aria-label="Save plan" title="Save plan">
        <SaveIcon />
      </button>
      {active && (
        <button type="submit" formAction={saveAndDeactivate} className="admin-btn ghost" disabled={pending}>
          Deactivate
        </button>
      )}
    </>
  );
}

export default function PlanForm({ plan }: { plan: Plan }) {
  const [features, setFeatures] = useState<string[]>(
    plan.features.length ? plan.features : [""],
  );

  const update = (i: number, val: string) =>
    setFeatures((f) => f.map((x, j) => (j === i ? val : x)));
  const add = () => setFeatures((f) => [...f, ""]);
  const remove = (i: number) =>
    setFeatures((f) => (f.length === 1 ? [""] : f.filter((_, j) => j !== i)));

  return (
    <form action={updatePlan} className="admin-card admin-form">
      <input type="hidden" name="id" value={plan.id} />

      <div className="admin-grid2">
        <label className="admin-field">
          <span>Name</span>
          <input
            name="name"
            required
            defaultValue={plan.name}
            className="admin-input"
            placeholder="e.g. Strength — 3 months"
          />
        </label>
        <label className="admin-field">
          <span>Price (USD)</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan.priceCents > 0 ? centsToDollars(plan.priceCents) : ""}
            className="admin-input"
            placeholder="0.00"
          />
        </label>
      </div>

      <label className="admin-field">
        <span>Tagline</span>
        <input
          name="tagline"
          defaultValue={plan.tagline ?? ""}
          className="admin-input"
          placeholder="One-line summary shown under the name"
        />
      </label>

      <label className="admin-field">
        <span>Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={plan.description ?? ""}
          className="admin-input"
          placeholder="What this package includes, who it's for…"
        />
      </label>

      <div className="admin-field">
        <span>Features</span>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              name="features"
              value={f}
              onChange={(e) => update(i, e.target.value)}
              className="admin-input"
              placeholder="e.g. 3 in-person sessions / week"
            />
            <button
              type="button"
              className="admin-btn sm ghost"
              onClick={() => remove(i)}
              aria-label="Remove feature"
              title="Remove feature"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-btn sm ghost"
          onClick={add}
          style={{ alignSelf: "flex-start" }}
        >
          <PlusIcon /> Add feature
        </button>
      </div>

      <div className="admin-actions">
        <FormButtons active={plan.active} />
        <ConfirmDelete
          action={deletePlan}
          fields={{ id: plan.id }}
          title={`Delete “${plan.name}”?`}
          message="This action can't be undone."
          triggerClass="admin-btn danger"
          triggerLabel={<TrashIcon />}
          triggerAriaLabel="Delete plan"
        />
      </div>

      <SavingOverlay />
    </form>
  );
}
