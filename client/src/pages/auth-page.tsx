import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { z } from "zod";
import Footer from "@/components/layout/footer";
import { Logo, BusIcon, SeniorIcon, CasinoIcon } from "@/components/ui/icons";

interface LoginFormProps {
  onSubmit: (data: z.infer<typeof loginSchema>) => void;
  isLoading: boolean;
}

function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" className="text-lg p-6" {...field} />
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
              <FormLabel className="text-lg">Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" className="text-lg p-6" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full text-lg p-6" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}

interface RegisterFormProps {
  onSubmit: (data: z.infer<typeof registerSchema>) => void;
  isLoading: boolean;
}

function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" className="text-lg p-6" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" className="text-lg p-6" {...field} />
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
              <FormLabel className="text-lg">Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" className="text-lg p-6" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" className="text-lg p-6" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...form.register("role")} value="user" />
        <Button type="submit" className="w-full text-lg p-6" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <BusIcon className="h-10 w-10 mr-3" />
            <h1 className="text-2xl font-bold">Shuttle Booking Platform</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-lg py-3">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-lg py-3">Register</TabsTrigger>
              </TabsList>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
                  <CardDescription className="text-lg">
                    Sign in to your Shuttle Booking Platform account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsContent value="login" className="mt-0">
                    <LoginForm 
                      onSubmit={(data) => loginMutation.mutate(data)} 
                      isLoading={loginMutation.isPending} 
                    />
                  </TabsContent>
                  <TabsContent value="register" className="mt-0">
                    <RegisterForm 
                      onSubmit={(data) => registerMutation.mutate(data)} 
                      isLoading={registerMutation.isPending} 
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          <div className="bg-primary/10 p-8 rounded-lg hidden md:block">
            <h2 className="text-3xl font-bold text-primary mb-6">Shuttle Booking Platform</h2>
            <div className="space-y-6 text-lg">
              <div className="flex items-start">
                <CasinoIcon className="h-8 w-8 text-primary mr-3 mt-1 flex-shrink-0" />
                <p>Enjoy hassle-free transportation to and from the casino with our luxury shuttle service.</p>
              </div>
              <div className="flex items-start">
                <SeniorIcon className="h-8 w-8 text-primary mr-3 mt-1 flex-shrink-0" />
                <p>Designed specifically for active adults 55+ in our partner communities across Georgia and North Carolina.</p>
              </div>
              <div className="flex items-start">
                <BusIcon className="h-8 w-8 text-primary mr-3 mt-1 flex-shrink-0" />
                <p>Book your seat today and experience the easiest way to enjoy a day at the casino!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
