function Header() {
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token')
  const handleLogout = () => {
    localStorage.removeItem('token')
    location.reload()
  }
  return (
    <header>
      {hasToken && (
        <button onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  )
}

export default Header
