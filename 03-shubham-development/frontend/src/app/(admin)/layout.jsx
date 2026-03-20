export const metadata = {
  title: "Admin Dashboard",
  description: "Admin area layout",
};

export default function AdminGroupLayout({ children }) {
  return (
    <div className="min-h-screen bg-(--admin-bg) text-white">
      {children}
    </div>
  );
}
