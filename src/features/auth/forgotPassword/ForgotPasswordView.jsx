"use client";

import { useState } from "react";
import { toast } from "sonner";
import AuthSplitLayout from "../../../components/layout/AuthSplitLayout.jsx";
import useFormFields from "../../../hooks/useFormFields.js";
import { requestPasswordReset } from "@/services/auth/authService";
import ForgotPasswordForm from "./components/ForgotPasswordForm.jsx";
import ForgotPasswordShowcase from "./components/ForgotPasswordShowcase.jsx";

export default function ForgotPasswordView() {
  const { fields, handleChange } = useFormFields({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const emailClean = (fields.email || "").trim();
    if (!emailClean) {
      setError("Ingresa el correo electrónico registrado.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await requestPasswordReset(emailClean);
      setResult(response);
      toast.success("Solicitud de recuperación procesada correctamente");
    } catch (err) {
      const msg = err?.message || "No se pudo procesar la solicitud de recuperación.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout aside={<ForgotPasswordShowcase />}>
      <ForgotPasswordForm
        fields={fields}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        result={result}
      />
    </AuthSplitLayout>
  );
}
