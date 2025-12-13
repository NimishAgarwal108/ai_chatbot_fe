"use client";

import { NAVIGATION_ROUTES } from "@/app/Constant";
import FormInput from "@/components/custom/FormInput";
import { Typography } from "@/components/custom/Typography";
import { Button } from "@/components/ui/button";
import { Form, Formik, FormikHelpers } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

/* -------------------- TYPES -------------------- */
interface ForgetPasswordValues {
  email: string;
}

/* -------------------- COMPONENT -------------------- */
export default function ForgetPasswordPage() {
  const initialValues: ForgetPasswordValues = {
    email: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
  });

  const handleSubmit = async (
    values: ForgetPasswordValues,
    {
      setSubmitting,
      resetForm,
    }: FormikHelpers<ForgetPasswordValues>
  ) => {
    try {
      // 🔹 MOCK SUCCESS (API NOT ADDED YET)
      console.log("Email submitted:", values.email);

      toast.success("OTP sent to your email (mock)");

      sessionStorage.setItem("resetEmail", values.email.trim());

      setTimeout(() => {
        window.location.href = NAVIGATION_ROUTES.RESET_PASSWORD;
      }, 1200);

      resetForm();
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 bg-gray-900/80 border border-gray-700 rounded-2xl shadow-2xl">

        <Typography
          variant="h4"
          align="center"
          textColor="muted"
          weight="semibold"
          className="mb-6"
        >
          Forgot Password
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                className="text-white"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg"
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
