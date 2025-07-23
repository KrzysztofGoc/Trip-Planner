import { useEffect } from "react";
import { useAuthStore } from "@/state/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
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
import { registerUser } from "@/api/users"; // <- the function from above

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(12, "Password must be at least 12 characters"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      nickname: "",
    },
  });

  const { mutate: registerMutate, isPending } = useMutation({
    mutationFn: (data: RegisterValues) =>
      registerUser({ ...data, user }),
    onSuccess: () => {
      toast.success("Account created successfully!");
      navigate("/trips");
    },
    onError: (err) => {
      const msg =
        err?.message?.replace(/^Firebase:\s*/, "") ||
        "Could not register";
      toast.error(msg);
      form.setError("email", { message: " " });
      form.setError("password", { message: " " });
      form.setError("nickname", { message: " " });
    },
  });

  useEffect(() => {
    if (!user?.isAnonymous && !isPending) {
      navigate("/account");
    }
  }, [navigate, user, isPending]);

  function onSubmit(data: RegisterValues) {
    registerMutate(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col gap-3 items-center pt-8">
          <Link to="/trips" className="flex items-center gap-3 group transition">
            <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center mb-2">
              <span className="text-3xl font-bold text-red-500">✈️</span>
            </div>
          </Link>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <p className="text-gray-500 text-sm text-center">Sign up to start planning your trips</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              autoComplete="on"
              noValidate
            >
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
                        autoComplete="new-password"
                        placeholder="••••••••"
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
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="nickname"
                        placeholder="How should we call you?"
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
                className="w-full h-12 rounded-lg bg-red-400 hover:bg-red-500 transition text-white text-lg font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-5 h-5" /> Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-red-400 font-semibold hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
