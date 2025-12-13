"use client";

import { Form, Formik, FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

import { NAVIGATION_ROUTES } from "@/app/Constant";
import FormInput from "@/components/custom/FormInput";
import { Typography } from "@/components/custom/Typography";
import { Button } from "@/components/ui/button";

/* -------------------- TYPES -------------------- */
interface OtpValues {
  otp: string;
}

interface PasswordValues {
  password: string;
  confirmPassword: string;
}

/* -------------------- COMPONENT -------------------- */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  /* -------- SESSION CHECK -------- */
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");

    if (!storedEmail) {
      toast.error("Please request OTP first");
      window.location.href = "/ForgetPassword";
    } else {
      setEmail(storedEmail);
    }
  }, []);

  /* -------- VALIDATION -------- */
  const otpSchema = Yup.object({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  const passwordSchema = Yup.object({
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password"),
  });

  /* -------- HANDLERS (FRONTEND ONLY) -------- */
  const handleVerifyOtp = async (
    values: OtpValues,
    { setSubmitting }: FormikHelpers<OtpValues>
  ) => {
    setTimeout(() => {
      setOtpVerified(true);
      toast.success("OTP verified (mock)");
      setSubmitting(false);
    }, 800);
  };

  const handleResetPassword = async (
    values: PasswordValues,
    { setSubmitting, resetForm }: FormikHelpers<PasswordValues>
  ) => {
    setTimeout(() => {
      toast.success("Password reset successfully (mock)");
      sessionStorage.removeItem("resetEmail");

      resetForm();
      setSubmitting(false);

      setTimeout(() => {
        window.location.href = NAVIGATION_ROUTES.LOG_IN;
      }, 1000);
    }, 800);
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
          {otpVerified ? "Set New Password" : "Verify OTP"}
        </Typography>

        {!otpVerified ? (
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={otpSchema}
            onSubmit={handleVerifyOtp}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <FormInput
                  name="otp"
                  label="OTP"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="text-white"
                />

                <Typography variant="muted" align="center">
                  OTP sent to{" "}
                  <span className="text-gray-300">{email}</span>
                </Typography>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={passwordSchema}
            onSubmit={handleResetPassword}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div className="text-center text-sm text-white bg-gray-800 border border-gray-600 py-2 rounded-lg">
                  OTP Verified ✓
                </div>

                <FormInput
                  name="password"
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  className="text-white"
                />

                <FormInput
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm new password"
                  className="text-white"
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}
