import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";
import { DebugInvoices } from "./DebugInvoices";
import { SidebarNavigation } from "./SidebarNavigation";
import { getUserFirstName } from "../utils/user";

interface ChatBotProps {
  user: any;
  accessToken: string;
  onSignOut: () => void;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export function ChatBot({ user, accessToken, onSignOut }: ChatBotProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `Hello ${getUserFirstName(
        user
      )}! I'm your MyAI assistant. I can help you with questions about your business, customers, invoices, and provide insights based on your data. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [dbDebugInfo, setDbDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Simple rule-based responses for demo
    if (message.includes("customer") && message.includes("how many")) {
      return "Based on your uploaded customer data, you have customers across various industries. I can help you analyze customer segments, contact information, and engagement patterns. What specific customer insights would you like to explore?";
    }

    if (
      message.includes("invoice") &&
      (message.includes("total") || message.includes("amount"))
    ) {
      return "I can help you analyze your invoice data including total amounts, payment status, and customer payment patterns. Would you like me to break down your revenue by customer, time period, or payment status?";
    }

    if (message.includes("revenue") || message.includes("sales")) {
      return "Revenue analysis is one of my key features! I can help you track sales trends, identify your best customers, analyze seasonal patterns, and forecast future revenue. What specific revenue metrics would you like to explore?";
    }

    if (message.includes("help") || message.includes("what can you do")) {
      return "I can help you with:\n\n• Customer analysis and segmentation\n• Invoice and payment tracking\n• Revenue and sales insights\n• Business trend analysis\n• Data visualization and reporting\n• Automated follow-ups and reminders\n\nJust ask me anything about your business data!";
    }

    if (message.includes("thank") || message.includes("thanks")) {
      return "You're welcome! I'm here to help you get the most insights from your business data. Feel free to ask me anything else!";
    }

    // Default responses
    const defaultResponses = [
      "That's an interesting question! Based on your business data, I can provide insights into customer behavior, invoice patterns, and revenue trends. Could you be more specific about what you'd like to analyze?",
      "I'd love to help you with that! With access to your customer and invoice data, I can provide detailed analytics and actionable insights. What particular aspect of your business would you like to explore?",
      "Great question! I can analyze your business data to provide valuable insights. Whether it's about customer retention, payment patterns, or growth opportunities, I'm here to help. What would you like to know more about?",
      "I'm designed to help you understand your business better through data analysis. I can look at customer trends, invoice analytics, and revenue patterns. What specific business challenge can I help you solve today?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: generateBotResponse(userMessage.content),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const suggestedQuestions = [
    "How many customers do I have?",
    "What's my total revenue this month?",
    "Which customers owe money?",
    "Show me my best-paying customers",
    "What are my payment trends?",
  ];

  return (
    <div className="min-h-screen">
      <SidebarNavigation onSignOut={onSignOut} />

      <div className="ml-20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <MyAIInvoicesLogo height={40} />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI Business Assistant
              </h1>
              <p className="text-gray-600">
                Your intelligent business data companion
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                Chat with MyAI
                <Badge className="bg-green-100 text-green-700 ml-auto">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.type === "bot" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] ${
                          message.type === "user" ? "order-last" : ""
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-line">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.type === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Suggested Questions */}
              {messages.length <= 1 && !isLoading && (
                <div className="px-4 pb-2">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Try asking:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question)}
                        className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your customers, invoices, or business insights..."
                    className="flex-1 bg-white"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Database Debug */}
          <div className="mt-6">
            <Card className="bg-yellow-50 border border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-800">
                  🔧 Invoice Database Debug
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DebugInvoices accessToken={accessToken} />
              </CardContent>
            </Card>
          </div>

          {/* Features Info */}
          <div className="mt-6 text-center">
            <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border border-white/30">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">
                  💡 This AI assistant can analyze your uploaded customer and
                  invoice data to provide business insights. For enhanced
                  features, consider integrating with external AI services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
