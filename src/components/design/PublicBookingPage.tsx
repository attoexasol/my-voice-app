import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  Home,
  CheckCircle2,
  User,
  MessageSquare,
  FormInput,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { MyAIInvoicesLogo } from "../MyAIInvoicesLogo";
import { BookingChatBot } from "../BookingChatBot";
import { supabase } from "../../utils/supabase/client";

// Get the Supabase URL and anon key from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface PublicBookingPageProps {
  bookingCode: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function PublicBookingPage({ bookingCode }: PublicBookingPageProps) {
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedType, setSelectedType] = useState<
    "online" | "call" | "house-visit"
  >("online");
  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    title: "",
    description: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    loadBusinessInfo();
  }, [bookingCode]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadBusinessInfo = async () => {
    try {
      if (!bookingCode) {
        throw new Error("No booking code provided");
      }

      // Look up the booking link in the database
      const { data: bookingLink, error } = await supabase
        .from("booking_links")
        .select("*")
        .eq("booking_code", bookingCode)
        .eq("is_active", true)
        .single();

      if (error || !bookingLink) {
        throw new Error("Booking page not found or expired");
      }

      // Get business owner's email
      let businessEmail = null;
      try {
        const emailResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/get-business-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ bookingCode }),
          }
        );

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          businessEmail = emailData.businessEmail;
        }
      } catch (emailError) {
        console.error("Failed to get business email:", emailError);
      }

      setBusinessInfo({
        businessName: bookingLink.business_name || "My AI Invoices",
        tagline:
          bookingLink.tagline ||
          "Schedule a meeting with us at your convenience",
        userId: bookingLink.user_id,
        businessEmail,
      });
    } catch (error: any) {
      console.error("Error loading booking info:", error);
      toast.error(error.message || "Booking page not found or expired");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (_date: Date) => {
    // Generate default slots without backend call
    generateDefaultSlots();
  };

  const generateDefaultSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: true,
      });
      if (hour < 17)
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:30`,
          available: true,
        });
    }
    setAvailableSlots(slots);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Process the audio recording
        processVoiceBooking(blob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Failed to access microphone. Please check permissions.");
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceBooking = async (_audioBlob: Blob) => {
    try {
      toast.info("Processing your voice message...");

      // Here you would send the audio to a transcription service
      // For now, we'll just show a placeholder message
      toast.success(
        "Voice message recorded! Please use the chatbot to complete your booking."
      );

      // TODO: Integrate with transcription service and booking API
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // formData.append('bookingCode', bookingCode);
      // const response = await fetch(`${SUPABASE_URL}/functions/v1/transcribe-booking`, {
      //   method: 'POST',
      //   body: formData
      // });
    } catch (error) {
      toast.error("Failed to process voice recording");
      console.error("Voice processing error:", error);
    }
  };

  const sendMeetingConfirmationEmail = async (meetingData: any) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          type: "booking",
          to: meetingData.customerEmail,
          data: meetingData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Confirmation email sent:", result);
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
  };

  const sendBusinessNotificationEmail = async (
    meetingData: any,
    businessEmail: string
  ) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          type: "business_notification",
          to: businessEmail,
          data: meetingData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Business notification email sent:", result);
    } catch (error) {
      console.error("Error sending business notification email:", error);
      throw error;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedDate ||
      !selectedTime ||
      !formData.customerName ||
      !formData.customerEmail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (selectedType === "house-visit" && !formData.location) {
      toast.error("Please provide your address for the house visit");
      return;
    }
    try {
      if (!businessInfo?.userId) {
        throw new Error("Business information not loaded");
      }

      // Create meeting directly in the meetings table
      const { error } = await supabase.from("meetings").insert([
        {
          user_id: businessInfo.userId,
          title: formData.title,
          description: formData.description,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
          duration: 60, // Default 1 hour
          type: selectedType,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          location: formData.location,
          notes: "",
          status: "scheduled",
        },
      ]);

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast.success(
        "Meeting booked successfully! Check your email for confirmation."
      );

      // Send confirmation email to customer
      try {
        await sendMeetingConfirmationEmail({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          appointmentDate: `${
            selectedDate.toISOString().split("T")[0]
          }T${selectedTime}`,
          duration: 60,
          serviceType: selectedType,
          companyName: businessInfo.businessName,
          companyAddress: "",
          companyPhone: "",
          bookingCode: bookingCode.substring(0, 8).toUpperCase(),
          notes: formData.notes,
          title: formData.title,
          description: formData.description,
          location: formData.location,
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't show error to user as meeting was created successfully
      }

      // Send notification email to business owner
      if (businessInfo.businessEmail) {
        try {
          await sendBusinessNotificationEmail(
            {
              customerName: formData.customerName,
              customerEmail: formData.customerEmail,
              customerPhone: formData.customerPhone,
              appointmentDate: `${
                selectedDate.toISOString().split("T")[0]
              }T${selectedTime}`,
              duration: 60,
              serviceType: selectedType,
              companyName: businessInfo.businessName,
              companyAddress: "",
              companyPhone: "",
              bookingCode: bookingCode.substring(0, 8).toUpperCase(),
              notes: formData.notes,
              title: formData.title,
              description: formData.description,
              location: formData.location,
            },
            businessInfo.businessEmail
          );
        } catch (notificationError) {
          console.error(
            "Failed to send business notification email:",
            notificationError
          );
          // Don't show error to user as meeting was created successfully
        }
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book meeting");
    }
  };

  if (!bookingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <MyAIInvoicesLogo height={60} className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Booking Link
            </h2>
            <p className="text-gray-600">
              No booking code provided. Please check your link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <MyAIInvoicesLogo height={80} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <MyAIInvoicesLogo height={60} className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Booking Page Not Found
            </h2>
            <p className="text-gray-600">
              This booking link is invalid or has expired. Please contact the
              business for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-4">
              Your meeting has been scheduled successfully.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{formData.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedDate?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{selectedTime}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to{" "}
              <strong>{formData.customerEmail}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-8">
          <MyAIInvoicesLogo height={60} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {businessInfo.businessName || "Book a Meeting"}
          </h1>
          <p className="text-gray-600">
            {businessInfo.tagline ||
              "Schedule a meeting with us at your convenience"}
          </p>
        </div>
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="!flex !flex-row !w-full max-w-2xl mx-auto mb-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="chatbot"
              className="flex-1 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1">
                Coming Soon
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              className="flex-1 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <Mic className="w-4 h-4" />
              <span>Voice</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1">
                Coming Soon
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="form"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FormInput className="w-4 h-4" />
              <span>Form</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chatbot" className="mt-0">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-gray-500">
                  Chat Booking
                </CardTitle>
                <CardDescription className="text-center">
                  Coming Soon - Chat with our AI assistant to book your meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mb-6">
                  <MessageSquare className="w-12 h-12 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Chat Booking Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  Soon you'll be able to chat with our AI assistant to book
                  meetings naturally.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 What's coming:</strong> Natural language booking,
                    smart scheduling, and instant confirmations!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="voice" className="mt-0">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-gray-500">
                  Voice Booking
                </CardTitle>
                <CardDescription className="text-center">
                  Coming Soon - Record your booking details and we'll schedule
                  it for you
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
                  <Mic className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Voice Booking Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  Soon you'll be able to record your voice to book meetings
                  naturally.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>🎤 What's coming:</strong> Voice-to-text booking,
                    smart date parsing, and hands-free scheduling!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="form" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader>
                  <CardTitle>Select Meeting Type</CardTitle>
                  <CardDescription>
                    Choose how you'd like to meet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: "online",
                        label: "Online Meeting",
                        icon: Video,
                        description: "Video conference",
                      },
                      {
                        value: "call",
                        label: "Phone Call",
                        icon: Phone,
                        description: "Voice call",
                      },
                      {
                        value: "house-visit",
                        label: "House Visit",
                        icon: Home,
                        description: "In-person meeting",
                      },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedType(option.value as any)}
                          className={`${
                            selectedType === option.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          } p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all`}
                        >
                          <Icon className="w-8 h-8 text-gray-700" />
                          <div className="text-center">
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>
                    Choose your preferred date and time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block">Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date: Date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Available Time Slots</Label>
                      {selectedDate ? (
                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`${
                                selectedTime === slot.time
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : slot.available
                                  ? "border-gray-200 hover:border-gray-300 bg-white"
                                  : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                              } p-2 rounded-lg border text-sm transition-all`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>Please select a date first</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerEmail: e.target.value,
                          })
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value,
                          })
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Meeting Topic *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Invoice Discussion"
                        required
                      />
                    </div>
                  </div>
                  {selectedType === "house-visit" && (
                    <div className="space-y-2">
                      <Label htmlFor="location">Your Address *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="123 Main Street, Suite 5"
                        required={selectedType === "house-visit"}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Notes</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Any additional information or special requests"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8"
                  disabled={!selectedDate || !selectedTime}
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Meeting
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Powered by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My AI Invoices
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
