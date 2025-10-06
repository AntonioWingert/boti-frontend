'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import Logo from '@/components/Logo'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      await api.post('/auth/register', formData)
      setSuccess(true)
    } catch (error: any) {
      console.error('Erro ao registrar:', error)
      
      // Tratar erros específicos da API
      if (error.response?.data?.error) {
        const apiError = error.response.data.error
        
        // Erro geral
        if (apiError.message) {
          setError(apiError.message)
        }
        
        // Erros de validação por campo
        if (apiError.details?.errors) {
          const fieldErrorsMap: {[key: string]: string} = {}
          apiError.details.errors.forEach((err: any) => {
            fieldErrorsMap[err.field] = err.suggestion || err.message
          })
          setFieldErrors(fieldErrorsMap)
        }
        
        // Erro específico de campo
        if (apiError.details?.field && apiError.details?.suggestion) {
          setFieldErrors({
            [apiError.details.field]: apiError.details.suggestion
          })
        }
      } else {
        setError('Erro ao registrar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Solicitação Enviada!</CardTitle>
            <CardDescription>
              Sua solicitação foi enviada com sucesso e está aguardando aprovação de um administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Você receberá um email quando sua conta for aprovada e estiver pronta para uso.
            </p>
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200">
                  Voltar ao Login
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full border-boti-primary text-boti-primary hover:bg-boti-primary hover:text-white transition-colors duration-200">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-boti-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-boti-primary hover:text-boti-primary/80 mb-4 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Logo size={48} />
          </div>
          <h1 className="text-3xl font-bold text-boti-text mb-2 font-poppins">Solicitar Acesso</h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para solicitar acesso à plataforma. 
            Sua solicitação será analisada por um administrador.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Informações do responsável pela empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Nome Completo *</Label>
                              <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="Seu nome completo"
                                className={fieldErrors.name ? 'border-red-500' : ''}
                              />
                              {fieldErrors.name && (
                                <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                placeholder="seu@email.com"
                                className={fieldErrors.email ? 'border-red-500' : ''}
                              />
                              {fieldErrors.email && (
                                <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                              )}
                            </div>
                          </div>

              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div className="border-t pt-6">
                <CardTitle className="text-lg mb-4">Dados da Empresa</CardTitle>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required
                      placeholder="Nome da sua empresa"
                      className={fieldErrors.companyName ? 'border-red-500' : ''}
                    />
                    {fieldErrors.companyName && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.companyName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyEmail">Email da Empresa *</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={formData.companyEmail}
                        onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
                        required
                        placeholder="empresa@email.com"
                        className={fieldErrors.companyEmail ? 'border-red-500' : ''}
                      />
                      {fieldErrors.companyEmail && (
                        <p className="text-sm text-red-500 mt-1">{fieldErrors.companyEmail}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                      <Input
                        id="companyPhone"
                        type="tel"
                        value={formData.companyPhone}
                        onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyAddress">Endereço da Empresa</Label>
                    <Input
                      id="companyAddress"
                      type="text"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem para o Administrador</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Conte-nos sobre sua empresa e como pretende usar a plataforma..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Processo de Aprovação</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sua solicitação será analisada em até 24 horas</li>
                  <li>• Você receberá um email quando aprovado</li>
                  <li>• Começará com um trial gratuito de 7 dias</li>
                  <li>• Suporte completo durante o período de teste</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200" 
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Solicitar Acesso'}
                </Button>
                <Link href="/login">
                  <Button type="button" variant="outline" className="w-full sm:w-auto border-boti-primary text-boti-primary hover:bg-boti-primary hover:text-white transition-colors duration-200">
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}