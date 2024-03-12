import { GeneralLayout } from "~/components/general-layout"

export default function Dashboard() {
  const isLogged = true
  if (!isLogged) {
    window.location.href = "/login"
  }

  return (
    <GeneralLayout>
      <div>Hello</div>
    </GeneralLayout>
  )
}

