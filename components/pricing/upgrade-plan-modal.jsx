"use client";

export default function UpgradePlanModal({ isOpen, onClose, plan, onConfirm, loading }) {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v20" /><path d="m17 5-5-3-5 3" /><path d="m17 19-5 3-5-3" /><path d="M3.5 8.5h17" /><path d="M3.5 15.5h17" /></svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-950">Upgrade to {plan.name}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Confirm your plan before continuing. You will be redirected to Stripe secure checkout.
        </p>
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <strong className="text-gray-950">{plan.name}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Price</span>
            <strong className="text-gray-950">${plan.price}/month</strong>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Storage</span>
            <strong className="text-gray-950">{plan.storage}</strong>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={loading} className="h-10 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700 disabled:opacity-60">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? "Loading..." : "Continue to Checkout"}</button>
        </div>
      </div>
    </div>
  );
}
