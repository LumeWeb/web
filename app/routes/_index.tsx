import Login from "./login"

export default function Index() {
  const isLogged = false

  if (isLogged) {
    window.location.href = "/dashboard"
  } else {
    window.location.href = "/login"
  }

  return isLogged ? <div>Dashboard</div> : <Login />
}
