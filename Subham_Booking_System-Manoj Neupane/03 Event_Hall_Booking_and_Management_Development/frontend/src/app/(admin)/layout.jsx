export const metadata = {
  title: "Admin Dashboard",
  description: "Admin area layout",
};

export default function AdminGroupLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-white">
      {children}
    </div>
  );
}
