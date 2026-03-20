import Sidebar from '../components/Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-60 pt-16 lg:pt-4 px-4 lg:px-8 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}