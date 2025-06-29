import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from 'sonner'
import { BarChart3, Users, FileText, LogIn, Upload } from 'lucide-react'

// Componentes existentes
import VendasTab from './components/VendasTab'
import VendedoresTab from './components/VendedoresTab'
import RelatoriosTab from './components/RelatoriosTab'

// Novos componentes
import LoginTab from './components/LoginTab'
import VendedorDashboard from './components/VendedorDashboard'
import ImportacaoTab from './components/ImportacaoTab'

function App() {
  const [vendedorLogado, setVendedorLogado] = useState(null)
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState('vendas')

  // Verificar se há vendedor logado no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('vendedor_token')
    const savedVendedor = localStorage.getItem('vendedor_info')
    
    if (savedToken && savedVendedor) {
      try {
        setToken(savedToken)
        setVendedorLogado(JSON.parse(savedVendedor))
        setActiveTab('dashboard')
      } catch (error) {
        // Se houver erro ao parsear, limpar localStorage
        localStorage.removeItem('vendedor_token')
        localStorage.removeItem('vendedor_info')
      }
    }
  }, [])

  const handleLoginSuccess = (vendedor, userToken) => {
    setVendedorLogado(vendedor)
    setToken(userToken)
    setActiveTab('dashboard')
  }

  const handleLogout = () => {
    setVendedorLogado(null)
    setToken(null)
    localStorage.removeItem('vendedor_token')
    localStorage.removeItem('vendedor_info')
    setActiveTab('vendas')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Sistema de Vendas e Comissões
              </h1>
            </div>
            {vendedorLogado && (
              <div className="text-sm text-gray-600">
                Logado como: <span className="font-medium">{vendedorLogado.nome_vendedor}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="vendas" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="vendedores" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Vendedores
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="importacao" className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Importação
            </TabsTrigger>
            <TabsTrigger value="login" className="flex items-center">
              <LogIn className="w-4 h-4 mr-2" />
              {vendedorLogado ? 'Dashboard' : 'Login'}
            </TabsTrigger>
            {vendedorLogado && (
              <TabsTrigger value="dashboard" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Meu Dashboard
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="vendas" className="mt-6">
            <VendasTab />
          </TabsContent>

          <TabsContent value="vendedores" className="mt-6">
            <VendedoresTab />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <RelatoriosTab />
          </TabsContent>

          <TabsContent value="importacao" className="mt-6">
            <ImportacaoTab />
          </TabsContent>

          <TabsContent value="login" className="mt-6">
            {vendedorLogado ? (
              <VendedorDashboard 
                vendedor={vendedorLogado} 
                token={token} 
                onLogout={handleLogout} 
              />
            ) : (
              <LoginTab onLoginSuccess={handleLoginSuccess} />
            )}
          </TabsContent>

          {vendedorLogado && (
            <TabsContent value="dashboard" className="mt-6">
              <VendedorDashboard 
                vendedor={vendedorLogado} 
                token={token} 
                onLogout={handleLogout} 
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  )
}

export default App

