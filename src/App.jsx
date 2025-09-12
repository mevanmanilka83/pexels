import Header from './components/header.jsx'
import AuthForm from './components/AuthForm.jsx'
import ImageGen from './components/ImageGen.jsx'

function App() {
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token')
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      
      <main className="flex flex-col items-center justify-center p-8 pt-16">
        {hasToken ? (
          <ImageGen />
        ) : (
          <AuthForm onSuccess={() => location.reload()} />
        )}
      </main>
    </div>
  )
}

export default App
