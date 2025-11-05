import { redirect } from "next/navigation";

export default function StartPage() {
// console.log(typeof window === "undefined" ? "Server" : "Client");
  redirect("/login");
}
