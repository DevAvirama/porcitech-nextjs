"use client";

import { useRouter } from 'next/navigation'
import AuthSplitLayout from '../../components/layout/AuthSplitLayout.jsx'
import useFormFields from '../../hooks/useFormFields.js'
import { signIn } from '../../services/auth/authService.js'
import LoginForm from './components/LoginForm.jsx'
import LoginShowcase from './components/LoginShowcase.jsx'

function LoginView() {
  const router = useRouter()
  const { fields, handleChange } = useFormFields({
    email: 'operario@sigep.com', // Cambiamos las credenciales predeterminadas para que coincidan con mock de authService.js
    password: 'ope123',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    const response = await signIn(fields)
    if (response.ok) {
      router.push('/dashboard')
    } else {
      alert(response.error || 'Credenciales incorrectas')
    }
  }

  return (
    <AuthSplitLayout aside={<LoginShowcase />}>
      <LoginForm fields={fields} onChange={handleChange} onSubmit={handleSubmit} />
    </AuthSplitLayout>
  )
}

export default LoginView
