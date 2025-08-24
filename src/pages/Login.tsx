import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, MessageSquare, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setIsLoading(false);

      if (error) {
        setErrors({ general: error.message });
        console.error("Login error:", error);
        return;
      }

      if (data?.user) {
        console.log("Login successful");
        
        // Get user role from their metadata first
        let userRole = data.user.user_metadata?.role || 'team_member';
        
        // Try to get more complete profile data from database
        try {
          type Profile = { role: string };
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single() as { data: Profile | null };
          
          if (profile?.role) {
            userRole = profile.role;
            console.log("Role retrieved from database:", userRole);
          } else {
            console.log("Using role from user metadata:", userRole);
          }
        } catch (profileError) {
          console.log("Database not set up, using metadata role:", userRole);
        }
        
        // Store user role in localStorage
        localStorage.setItem('userRole', userRole);

        // Set admin flag based on role
        if (userRole === "admin") {
          localStorage.setItem('adminAuthenticated', 'true');
          // Navigate to admin page for admins
          navigate("/admin", { replace: true });
        } else {
          localStorage.setItem('adminAuthenticated', 'false');
          // Navigate to the original requested page or home
          navigate(from, { replace: true });
        }
        
        console.log("User role:", userRole);
      }
    } catch (error: any) {
      setIsLoading(false);
      setErrors({ general: error.message || "An error occurred during login" });
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-primary-light/20 to-background">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="shadow-large border-border/50 animate-scale-in">
            <CardHeader className="text-center pb-2">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-primary-dark">
                Welcome Back
              </CardTitle>
              <p className="text-muted-foreground">
                Sign in to access your DocsAI dashboard
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {errors.general && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="w-full">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Link 
                to="/support" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}