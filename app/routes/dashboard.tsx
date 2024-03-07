import { DashboardLayout } from "~/components/dashboard-layout"

export default function Dashboard() {
  const isLogged = true
  if (!isLogged) {
    window.location.href = "/login"
  }

  return (
    <DashboardLayout>
      <div>Hello</div>
    </DashboardLayout>
  )
}
