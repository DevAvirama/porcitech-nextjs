"use client";

import { useRouter } from 'next/navigation'
import AuthSplitLayout from '../../../components/layout/AuthSplitLayout.jsx'
import useFormFields from '../../../hooks/useFormFields.js'
import ForgotPasswordForm from './components/ForgotPasswordForm.jsx'
import ForgotPasswordShowcase from './components/ForgotPasswordShowcase.jsx'

export default function ForgotPasswordView() {
  const router = useRouter()
  const { fields, handleChange } = useFormFields({
    email: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    // Simulación de envío de correo
    alert("Se han enviado las instrucciones de recuperación a tu correo electrónico (Simulación).")
    router.push('/login')
  }

  return (
    <AuthSplitLayout aside={<ForgotPasswordShowcase />}>
      <ForgotPasswordForm fields={fields} onChange={handleChange} onSubmit={handleSubmit} />
    </AuthSplitLayout>
  )
}
