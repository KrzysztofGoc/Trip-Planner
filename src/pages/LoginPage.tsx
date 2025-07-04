import { useState, useEffect } from "react";
import { useAuthStore } from "@/state/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/users";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().nonempty("Password cannot be empty"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear loginError when user changes input
  useEffect(() => {
    const subscription = form.watch(() => {
      if (loginError) setLoginError(null);
    });
    return () => subscription.unsubscribe();
  }, [form, loginError]);

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("Logged in successfully.");
      navigate("/trips");
    },
    onError: () => {
      setLoginError("Could not log in. Please check your credentials.");
      form.setError("email", { message: "" });
      form.setError("password", { message: "" });
    },
  });

  // Redirect user if already logged in
  useEffect(() => {
    if (!user?.isAnonymous && !isPending) {
      navigate("/account");
    }
  }, [navigate, user, isPending]);

  function onSubmit(data: LoginValues) {
    loginMutate({ login: data.email, password: data.password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col gap-3 items-center pt-8">
          <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center mb-2">
            <span className="text-3xl font-bold">✈️</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <p className="text-gray-500 text-sm text-center">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              autoComplete="on"
              noValidate
            >
              {loginError && (
                <div className="text-sm text-center text-red-500 font-semibold mb-2">
                  {loginError}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 rounded-lg bg-red-400 text-white text-lg font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-5 h-5" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-red-400 font-semibold hover:underline">
              Don't have an account? Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
