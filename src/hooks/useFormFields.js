import { useState } from "react";

export default function useFormFields(initialValues) {
  const [fields, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const reset = () => setValues(initialValues);

  return [fields, handleChange, reset];
}
