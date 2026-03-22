import Sidebar from '../components/Sidebar'
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden w-full">
      <Sidebar />
      <main className="flex-1 lg:ml-60 pt-16 lg:pt-0 px-4 lg:px-8 py-8 overflow-x-hidden" style={{ maxWidth: '100vw', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}