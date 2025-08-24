import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Mic, 
  MicIcon, 
  Bot, 
  User, 
  Plus,
  MessageSquare,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: Date;
  messageCount: number;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI documentation assistant. I can help you find information from your company's knowledge base. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversations] = useState<Conversation[]>([
    { id: "1", title: "Employee Handbook Questions", lastMessage: new Date(), messageCount: 12 },
    { id: "2", title: "IT Support Procedures", lastMessage: new Date(Date.now() - 86400000), messageCount: 8 },
    { id: "3", title: "Project Management Guidelines", lastMessage: new Date(Date.now() - 172800000), messageCount: 15 },
  ]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Get the response as text first
      const rawResponse = await response.text();
      
      let parsedResponse;
      try {
        // Try to parse the string response as JSON
        parsedResponse = JSON.parse(rawResponse);
      } catch (error) {
        // If parsing fails, use the raw string response
        parsedResponse = { response: rawResponse };
      }
      
      // Extract and format the message content from the parsed response
      let messageContent = typeof parsedResponse === 'string' 
        ? parsedResponse 
        : parsedResponse.response || parsedResponse.message || parsedResponse.answer || 
          (typeof parsedResponse === 'object' ? JSON.stringify(parsedResponse) : rawResponse);

      // Format the content if it contains policy information
      if (messageContent.includes("HR policies") || messageContent.includes("Policy")) {
        const sections = messageContent.split(/(?=\*\*[\w\s&]+\*\*)/);
        messageContent = sections.map(section => {
          // Extract policy name and content
          const policyMatch = section.match(/\*\*([^*]+)\*\*(.+?)(?=\*\*|$)/s);
          if (policyMatch) {
            const [_, policyName, content] = policyMatch;
            return `📋 **${policyName}**\n${content.trim()}\n`;
          }
          return section;
        }).join("\n");

        // Add a header if it's HR policy content
        if (messageContent.includes("📋")) {
          messageContent = `# HR Policies Overview\n\n${messageContent}`;
        }
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: messageContent,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input logic will be implemented later
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:flex w-80 border-r border-border bg-muted/30">
          <div className="flex flex-col w-full">
            {/* New Chat Button */}
            <div className="p-4 border-b border-border">
              <Button variant="default" size="lg" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Recent Conversations</h3>
                {conversations.map((conv) => (
                  <Card key={conv.id} className="cursor-pointer hover:shadow-soft transition-shadow border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2">
                          {conv.title}
                        </h4>
                        <div className="text-xs text-muted-foreground ml-2">
                          {formatDate(conv.lastMessage)}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {conv.messageCount} messages
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 hero-gradient rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">DocsAI Assistant</h1>
                  <p className="text-sm text-muted-foreground">Ask anything about your documentation</p>
                </div>
              </div>
              
              {/* Mobile New Chat Button */}
              <div className="lg:hidden">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-3 animate-fade-in",
                    message.isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.isUser ? "bg-primary text-white" : "hero-gradient"
                  )}>
                    {message.isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={cn(
                    "flex flex-col max-w-2xl",
                    message.isUser ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl shadow-soft",
                      message.isUser 
                        ? "bg-primary text-white rounded-br-md" 
                        : "bg-card border border-border rounded-bl-md"
                    )}>
                      <div className={cn(
                        "text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mb-2 prose-p:my-1 prose-strong:font-semibold",
                        message.isUser ? "text-white prose-invert" : "text-foreground"
                      )}>
                        <div dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n\n/g, '<br/><br/>')
                            .replace(/📋/g, '<span class="text-xl">📋</span>')
                            .replace(/# ([^\n]+)/g, '<h1 class="text-xl font-bold mb-4">$1</h1>')
                        }} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start space-x-3 animate-fade-in">
                  <div className="w-8 h-8 hero-gradient rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about your documentation..."
                    className="min-h-[48px] pr-12 resize-none bg-muted/50 border-border/50 focus:bg-background"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceInput}
                    className={cn(
                      "absolute right-2 top-2",
                      isListening ? "text-red-500 animate-pulse" : "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <MicIcon className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  variant="cta" 
                  size="lg"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}