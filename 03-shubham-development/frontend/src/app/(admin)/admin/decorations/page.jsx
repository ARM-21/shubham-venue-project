import { redirect } from "next/navigation";

export default function AdminDecorationsPage() {
  redirect("/admin/menus?tab=decor");
}
