"use client";

import { ErrorMessage, Field } from "formik";
import React from "react";
import { Input } from "../ui/input";

interface FormInputProps {
  label?: string;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  className,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}

      <Field
        as={Input}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={className}
      />

      <ErrorMessage
        name={name}
        component="p"
        className="text-sm text-red-500"
      />
    </div>
  );
};

export default FormInput;
