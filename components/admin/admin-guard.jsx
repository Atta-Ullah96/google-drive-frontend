export default function AdminGuard({ children }) {
  // UI-only placeholder. Enforce the admin role on the server before enabling
  // real admin endpoints; client-side checks alone are not a security boundary.
  return children;
}
