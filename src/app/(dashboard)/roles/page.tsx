import { redirect } from "next/navigation";

// Page fusionnée dans /members?tab=roles
export default function RolesPage() {
  redirect("/members?tab=roles");
}
