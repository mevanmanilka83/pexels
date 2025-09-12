function Header() {
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token')
  const handleLogout = () => {
    localStorage.removeItem('token')
    location.reload()
  }
  return (
    <header className="w-full p-3 sm:p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-end">
        {hasToken && (
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
