import { redirect } from "next/navigation";

export default function AdminDecorationDetailRedirect() {
  redirect("/admin/menus?tab=decor");
}
