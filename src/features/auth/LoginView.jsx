"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthSplitLayout from '../../components/layout/AuthSplitLayout.jsx'
import useFormFields from '../../hooks/useFormFields.js'
import { login } from '../../services/auth/authService.js'
import LoginForm from './components/LoginForm.jsx'
import LoginShowcase from './components/LoginShowcase.jsx'

function LoginView() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { fields, handleChange } = useFormFields({
    email: '',
    password: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(fields.email, fields.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthSplitLayout aside={<LoginShowcase />}>
      <LoginForm
        fields={fields}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </AuthSplitLayout>
  )
}

export default LoginView
