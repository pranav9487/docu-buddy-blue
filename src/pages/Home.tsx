import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  Bot, 
  Shield, 
  Zap, 
  ArrowRight,
  FileText,
  Users,
  Clock
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  // Mock auth state - will be replaced with real auth later
  const isAuthenticated = false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to ask questions");
      return;
    }
    console.log("Question:", question);
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Voice & Text Input",
      description: "Ask questions using natural language or voice commands for instant responses from your knowledge base."
    },
    {
      icon: Bot,
      title: "Instant AI Responses", 
      description: "Get accurate, contextual answers powered by advanced AI that understands your internal documentation."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your company data stays secure with enterprise-grade encryption and privacy controls."
    }
  ];

  const stats = [
    { icon: FileText, label: "Documents Processed", value: "High Document Upload Support" },
    { icon: Users, label: "Active Users", value: "Growing User Base" },
    { icon: Clock, label: "Avg Response Time", value: "Quick Responses" }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-dark mb-6 leading-tight">
              AI-Powered Internal
              <br />
              <span className="hero-gradient bg-clip-text text-transparent">
                Documentation Assistant
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant answers from your company's knowledge base using natural language 
              or voice commands. No more searching through endless documents.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {isAuthenticated ? (
                <Link to="/chat">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Try It Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary-dark">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make your internal knowledge instantly accessible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift border-border/50 card-gradient animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-dark mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
              Try It Yourself
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the power of AI-driven documentation search
            </p>
          </div>

          <Card className="shadow-large border-border/50">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything about our internal docs..."
                    className="text-lg h-14 bg-muted/50 border-border/50 focus:bg-background"
                  />
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    type="button" 
                    variant="cta" 
                    size="lg"
                    className="w-full sm:w-2/3"
                    onClick={() => {
                      setQuestion("How do I access the employee handbook?");
                      navigate("/chat");
                    }}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Try Example
                  </Button>
                </div>

                {!isAuthenticated && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Login required to see AI responses and access all features
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Documentation?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of teams already using DocsAI to make their knowledge instantly accessible
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto font-semibold">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto bg-white text-primary-dark hover:bg-white/90 font-semibold">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}