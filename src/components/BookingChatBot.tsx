import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

// Get the Supabase URL and anon key from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface BookingChatBotProps {
  bookingCode: string;
  onMeetingBooked?: (meeting: any) => void;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  parsedData?: any;
}

export function BookingChatBot({
  bookingCode,
  onMeetingBooked,
}: BookingChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `👋 Hi! I'm your booking assistant. You can paste your meeting details here, and I'll help you schedule it!\n\nFor example, try:\n"Tomorrow at 3pm to discuss the new project"\n"Meeting on Friday at 10am for consultation"\n"Next Monday 2pm, John Smith, discuss pricing"`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
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
        (scrollElement as HTMLElement).scrollTop = (
          scrollElement as HTMLElement
        ).scrollHeight;
      }
    }
  };

  const parseMeetingDetails = async (text: string) => {
    try {
      setIsParsing(true);
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/parse-meeting-details`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, bookingCode }),
        }
      );
      if (!response.ok) throw new Error("Failed to parse meeting details");
      const data = await response.json();
      return data.parsed;
    } catch (error: any) {
      console.error("Parse error:", error);
      throw error;
    } finally {
      setIsParsing(false);
    }
  };

  const bookMeeting = async (parsedData: any, originalText: string) => {
    try {
      setIsLoading(true);
      if (!parsedData.date || !parsedData.time) {
        throw new Error(
          "Could not determine date and time from your message. Please try again with a clearer format."
        );
      }
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/book-meeting/${bookingCode}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: parsedData.date,
            time: parsedData.time,
            type: parsedData.type || "online",
            customerName: parsedData.customerName || "Guest",
            customerEmail: parsedData.customerEmail || "guest@example.com",
            customerPhone: parsedData.customerPhone || "",
            title: parsedData.title || "Meeting",
            description: parsedData.description || originalText,
            location: parsedData.location || "",
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to book meeting");
      }
      const result = await response.json();
      return result.meeting;
    } catch (error: any) {
      console.error("Booking error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const formatParsedData = (parsed: any): string => {
    const parts: string[] = [];
    if (parsed.date && parsed.time) {
      const dateObj = new Date(parsed.date + "T" + parsed.time);
      parts.push(
        `📅 ${dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      );
      parts.push(
        `🕐 ${dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`
      );
    }
    if (parsed.title) parts.push(`📋 ${parsed.title}`);
    if (parsed.type) {
      const typeIcons: Record<string, string> = {
        online: "💻 Online Meeting",
        call: "📞 Phone Call",
        "house-visit": "🏠 House Visit",
      };
      parts.push(typeIcons[parsed.type] || `📍 ${parsed.type}`);
    }
    if (parsed.customerName) parts.push(`👤 ${parsed.customerName}`);
    if (parsed.location) parts.push(`📍 ${parsed.location}`);
    if (parsed.description && parsed.description !== parsed.title)
      parts.push(`📝 ${parsed.description}`);
    return parts.join("\n");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isParsing) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    setInputMessage("");
    try {
      const parsed = await parseMeetingDetails(messageText);
      const formattedDetails = formatParsedData(parsed);
      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `Great! I understood the following details:\n\n${formattedDetails}\n\nI'm booking this for you now... ⏳`,
        timestamp: new Date(),
        parsedData: parsed,
      };
      setMessages((prev) => [...prev, confirmMessage]);
      const meeting = await bookMeeting(parsed, messageText);
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "bot",
        content: `✅ Perfect! Your meeting has been scheduled successfully!\n\nYou'll receive a confirmation email shortly. Is there anything else I can help you with?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
      toast.success("Meeting booked successfully!");
      if (onMeetingBooked) onMeetingBooked(meeting);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: "bot",
        content: `😕 ${error.message}\n\nPlease try again with a format like:\n"Tomorrow at 3pm to discuss the project"\n"Friday at 10am for a consultation"\n"Next Monday 2pm with John Smith"`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(error.message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const quickExamples = [
    "Tomorrow at 2pm",
    "Friday 10am consultation",
    "Next Monday 3pm project discussion",
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-purple-200/50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          Quick Booking Assistant
          <Badge className="bg-green-100 text-green-700 ml-auto">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
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
            {(isParsing || isLoading) && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {isParsing
                        ? "Understanding your request..."
                        : "Booking meeting..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        {messages.length <= 1 && !isLoading && !isParsing && (
          <div className="px-4 pb-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1 mt-2">
              <Sparkles className="w-4 h-4" />
              Quick examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(example)}
                  className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste your meeting details here... (e.g., Tomorrow at 3pm)"
              className="flex-1 bg-white"
              disabled={isLoading || isParsing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isParsing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading || isParsing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Just paste your meeting details and I'll handle the rest!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
