import { useState } from "react";

export default function useFormFields(initialValues) {
  const [fields, setFields] = useState(initialValues);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFields((currentFields) => ({
      ...currentFields,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return {
    fields,
    setFields,
    handleChange,
  };
}
