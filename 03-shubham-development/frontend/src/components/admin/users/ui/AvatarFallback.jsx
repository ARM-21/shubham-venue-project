export default function Avatar({ name = "User", src }) {
  if (src) {
    return <div className="size-10 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${src})` }} />;
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase?.() || "")
    .join("") || "U";
  return (
    <div className="size-10 rounded-full bg-[var(--admin-bg)] border border-white/10 text-white flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}
