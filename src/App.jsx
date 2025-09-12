import Header from './components/header.jsx'
import Footer from './components/Footer.jsx'
import AuthForm from './components/AuthForm.jsx'
import ImageGen from './components/ImageGen.jsx'

function App() {
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token')
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 pt-12 sm:pt-16">
        {hasToken ? (
          <ImageGen />
        ) : (
          <AuthForm onSuccess={() => location.reload()} />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
