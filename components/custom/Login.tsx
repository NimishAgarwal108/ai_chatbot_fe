"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFormik } from "formik";
import { Bot, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";
import Logo from "./Logo";
import { Typography } from "./Typography";

const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
});

const signupSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name is too short")
    .required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[@$!%*?&#^()\-_=+{}[\]|;:'",.<>/~`]/,
      "Must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

// Main App Component
export default function AuthApp() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      rememberMe: false,
      confirmPassword: "",
    },
    validationSchema: isLogin ? loginSchema : signupSchema,
    onSubmit: (values) => {
      console.log(values);
      setToastMessage(`${isLogin ? "Login" : "Signup"} successful!`);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        router.push("/ChatWindow");
      }, 2000);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10">
        <Logo />
      </div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Auth Card */}
      <Card className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-2 shadow-lg shadow-purple-500/50 mx-auto animate-pulse">
            <Bot className="w-10 h-10 text-white" />
          </div>

          <div>
            <CardTitle className="text-3xl font-bold">
              <Typography variant="h2" align="center" className="text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </Typography>
            </CardTitle>
            <CardDescription className="mt-2">
              <Typography
                variant="muted"
                align="center"
                className="text-slate-400"
              >
                {isLogin
                  ? "Sign in to continue your AI journey"
                  : "Start your AI conversation experience"}
              </Typography>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sliding Login / Signup Toggle */}
          <div className="relative w-full bg-slate-800/50 rounded-xl p-1 flex mb-6">
            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-all duration-300 ${
                isLogin ? "left-1" : "left-1/2"
              }`}
            ></div>

            {/* Login Button */}
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`relative z-10 w-1/2 text-center py-2 font-semibold transition-colors ${
                isLogin ? "text-white" : "text-slate-400"
              }`}
            >
              Login
            </button>

            {/* Signup Button */}
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`relative z-10 w-1/2 text-center py-2 font-semibold transition-colors ${
                !isLogin ? "text-white" : "text-slate-400"
              }`}
            >
              Signup
            </button>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  <Typography variant="label" className="text-slate-300">
                    Full Name
                  </Typography>
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="Name"
                    className="pl-11 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <Typography
                      variant="small"
                      className="text-red-400 text-sm"
                    >
                      {formik.errors.name}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-300">
                <Typography variant="label" className="text-slate-300">
                  Email Address
                </Typography>
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Email"
                  className="pl-11 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                  required
                />
                {formik.touched.email && formik.errors.email && (
                  <Typography variant="small" className="text-red-400 text-sm">
                    {formik.errors.email}
                  </Typography>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                <Typography variant="label" className="text-slate-300">
                  Password
                </Typography>
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="••••••••"
                  className="pl-11 pr-11 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                  required
                />
                {formik.touched.password && formik.errors.password && (
                  <Typography variant="small" className="text-red-400 text-sm">
                    {formik.errors.password}
                  </Typography>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onCheckedChange={(value) =>
                      formik.setFieldValue("rememberMe", value)
                    }
                    className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-slate-400 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-400 hover:text-blue-300 p-0 h-auto cursor-pointer"
                >
                  Forgot password?
                </Button>
              </div>
            )}
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    <Typography variant="label" className="text-slate-300">
                      Confirm Password
                    </Typography>
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      placeholder="Re-enter Password"
                      className="pl-11 pr-11 bg-slate-800/50 border-slate-700 text-white"
                    />

                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <Typography
                          variant="small"
                          className="text-red-400 text-sm"
                        >
                          {formik.errors.confirmPassword}
                        </Typography>
                      )}

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onCheckedChange={(value) =>
                      formik.setFieldValue("rememberMe", value)
                    }
                    className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-slate-400 cursor-pointer"
                  >
                    I agree to the Terms & Conditions and Privacy Policy
                  </Label>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={
                !formik.values.rememberMe ||
                !formik.values.email ||
                !formik.values.password ||
                (!isLogin && !formik.values.confirmPassword)
              }
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold h-12 text-base shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <Typography variant="small" className="text-slate-400">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 font-semibold p-0 h-auto cursor-pointer"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Button>
            </Typography>
          </div>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-slate-700" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3">
              <Typography variant="small" className="text-slate-500">
                Or continue with
              </Typography>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid">
            <Button
              variant="outline"
              className="bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-300 h-12 transition-all hover:border-slate-600 cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-10 left-15 text-center">
        <Typography variant="small" className="text-slate-500">
          © 2025 AI Chat Bot By SumNex Tech. All rights reserved.
        </Typography>
      </div>
      <div
        className={`
          fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl
          text-white font-medium shadow-lg transition-all duration-500 z-50
          ${showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          bg-green-600
        `}
      >
        {toastMessage}
      </div>
    </div>
  );
}
