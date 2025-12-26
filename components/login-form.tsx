"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn, signUp } from "@/lib/auth-client"

type AuthMode = "login" | "signup"

// Create form schemas for login and signup
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
})

const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string>("")

  // Initialize form with appropriate schema based on mode
  const form = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" && { name: "" }),
    } as any,
  })

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsLoading(true)
    setAuthError("")

    try {
      if (mode === "login") {
        const loginData = data as LoginFormData
        const result = await signIn.email({
          email: loginData.email,
          password: loginData.password,
          callbackURL: "/",
        })

        if (result.error) {
          setAuthError(result.error.message || "Login failed")
        } else {
          // Success - redirect or handle success
          console.log("Login successful", result.data)
          // Refresh the page to update session
          window.location.href = "/"
        }
      } else {
        const signupData = data as SignupFormData
        const result = await signUp.email({
          email: signupData.email,
          password: signupData.password,
          name: signupData.name,
          callbackURL: "/",
        })

        if (result.error) {
          setAuthError(result.error.message || "Signup failed")
        } else {
          // Success - redirect or handle success
          console.log("Signup successful", result.data)
          // After successful signup, switch to login mode
          window.location.href = "/"
        }
      }
    } catch (err) {
      setAuthError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setAuthError("")
    form.reset()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "login" ? "Login to your account" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Enter your email below to login to your account"
              : "Enter your details below to create your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {mode === "signup" && (
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="John Doe"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      {mode === "login" && (
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      )}
                    </div>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {authError && (
                <Field>
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {authError}
                  </div>
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? (mode === "login" ? "Logging in..." : "Signing up...")
                    : (mode === "login" ? "Login" : "Sign up")
                  }
                </Button>
                {/* <Button variant="outline" type="button">
                  Login with Google
                </Button> */}
                <FieldDescription className="text-center">
                  {mode === "login"
                    ? <>Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Sign up
                      </button>
                    </>
                    : <>Already have an account?{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Login
                      </button>
                    </>
                  }
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
