import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Video,
  Phone,
  Home,
  Plus,
  Edit,
  Trash2,
  Mail,
  Share2,
  Link2,
  Copy,
} from "lucide-react";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";
import { SidebarNavigation } from "./SidebarNavigation";
import { toast } from "sonner";
import { supabase } from "../utils/supabase/client";

// Get the Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: "online" | "call" | "house-visit";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  location?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

interface CalendarViewProps {
  onSignOut: () => void;
  accessToken: string;
}

export function CalendarView({ onSignOut, accessToken }: CalendarViewProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">(
    "upcoming"
  );
  const [bookingLink, setBookingLink] = useState<string>("");
  const [showBookingLink, setShowBookingLink] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: 60,
    type: "online" as "online" | "call" | "house-visit",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (accessToken) {
      loadMeetings();
      loadBookingLink();
    }
  }, [accessToken]);

  const loadMeetings = async () => {
    try {
      // Use Supabase to fetch meetings from database
      const { data: meetingsData, error } = await supabase
        .from("meetings")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) {
        console.error("Error loading meetings:", error);
        // If table doesn't exist, just set empty array
        if (
          error.message.includes("relation") ||
          error.message.includes("does not exist")
        ) {
          console.log("Meetings table doesn't exist yet - using empty state");
          setMeetings([]);
        } else {
          throw error;
        }
      } else {
        // Transform the data to match the Meeting interface
        const formattedMeetings = (meetingsData || []).map((m: any) => ({
          id: m.id,
          title: m.title || "",
          description: m.description || "",
          date: m.date || new Date().toISOString().split("T")[0],
          time: m.time || "09:00",
          duration: m.duration || 60,
          type: m.type || "online",
          customerName: m.customer_name || "",
          customerEmail: m.customer_email || "",
          customerPhone: m.customer_phone || "",
          location: m.location,
          status: m.status || "scheduled",
          notes: m.notes,
          createdAt: m.created_at || new Date().toISOString(),
        }));
        setMeetings(formattedMeetings);
      }
    } catch (error) {
      console.error("Error loading meetings:", error);
      setMeetings([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.customerName || !formData.customerEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to create meetings");
        return;
      }

      const meetingData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        type: formData.type,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        location: formData.location,
        notes: formData.notes,
        status: "scheduled" as const,
      };

      if (editingMeeting) {
        // Update existing meeting
        const { error: updateError } = await supabase
          .from("meetings")
          .update(meetingData)
          .eq("id", editingMeeting.id);

        if (updateError) throw updateError;
        await loadMeetings();
        toast.success("Meeting updated successfully");
      } else {
        // Create new meeting
        const { error: insertError } = await supabase
          .from("meetings")
          .insert([meetingData]);

        if (insertError) {
          // If table doesn't exist, show helpful message
          if (
            insertError.message.includes("relation") ||
            insertError.message.includes("does not exist")
          ) {
            toast.error(
              "Meetings table not set up yet. Please run database migrations."
            );
            return;
          }
          throw insertError;
        }
        await loadMeetings();
        toast.success("Meeting scheduled successfully");

        // Send confirmation email to customer
        try {
          await sendMeetingConfirmationEmail({
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            appointmentDate: `${formData.date}T${formData.time}`,
            duration: formData.duration,
            serviceType: formData.type,
            companyName: user.user_metadata?.name || "My Business",
            companyAddress: user.user_metadata?.address || "",
            companyPhone: user.user_metadata?.phone || "",
            bookingCode: user.id.substring(0, 8).toUpperCase(),
            notes: formData.notes,
            title: formData.title,
            description: formData.description,
            location: formData.location,
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // Don't show error to user as meeting was created successfully
        }
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("Failed to save meeting");
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", meetingId);

      if (error) throw error;

      setMeetings(meetings.filter((m) => m.id !== meetingId));
      toast.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      type: meeting.type,
      customerName: meeting.customerName,
      customerEmail: meeting.customerEmail,
      customerPhone: meeting.customerPhone,
      location: meeting.location || "",
      notes: meeting.notes || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMeeting(null);
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      duration: 60,
      type: "online",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      location: "",
      notes: "",
    });
  };

  const getMeetingTypeIcon = (type: "online" | "call" | "house-visit") => {
    switch (type) {
      case "online":
        return <Video className="w-4 h-4" />;
      case "call":
        return <Phone className="w-4 h-4" />;
      case "house-visit":
        return <Home className="w-4 h-4" />;
    }
  };

  const getMeetingTypeColor = (type: "online" | "call" | "house-visit") => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-700";
      case "call":
        return "bg-green-100 text-green-700";
      case "house-visit":
        return "bg-purple-100 text-purple-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFilteredMeetings = () => {
    const today = new Date().toISOString().split("T")[0];
    switch (activeTab) {
      case "upcoming":
        return meetings.filter(
          (m) =>
            m.date >= today &&
            m.status !== "completed" &&
            m.status !== "cancelled"
        );
      case "completed":
        return meetings.filter(
          (m) => m.status === "completed" || m.status === "cancelled"
        );
      default:
        return meetings;
    }
  };

  const getSelectedDateMeetings = () => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split("T")[0];
    return meetings.filter((meeting) => meeting.date === dateStr);
  };

  const loadBookingLink = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user found for booking link");
        return;
      }

      // Check if user already has a booking link
      const { data: existingLink, error: fetchError } = await supabase
        .from("booking_links")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      let bookingCode: string;

      if (existingLink && !fetchError) {
        // Use existing booking code
        bookingCode = existingLink.booking_code;
        console.log("Found existing booking link");
      } else {
        // Create a new booking link
        bookingCode = user.id.substring(0, 12);

        const { error: insertError } = await supabase
          .from("booking_links")
          .insert([
            {
              user_id: user.id,
              booking_code: bookingCode,
              business_name: user.user_metadata?.name || "My Business",
              tagline: "Schedule a meeting with us",
              is_active: true,
            },
          ]);

        if (insertError) {
          console.error("Error creating booking link:", insertError);
          // If it fails, still use the code (might already exist)
        } else {
          console.log("Created new booking link");
        }
      }

      // Create the booking link
      const link = `${window.location.origin}/book/${bookingCode}`;
      setBookingLink(link);

      console.log("Booking link ready:", link);
    } catch (error: any) {
      console.error("Error loading booking link:", error);
      // Don't show error toast for booking link - it's not critical
    }
  };

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingLink);
    toast.success("Booking link copied to clipboard!");
  };

  const sendMeetingConfirmationEmail = async (meetingData: any) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <SidebarNavigation onSignOut={onSignOut} />
      <div className="pl-20 p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <MyAIInvoicesLogo height={40} />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Calendar & Meetings
                </h1>
                <p className="text-gray-600">
                  Schedule and manage customer meetings
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBookingLink(!showBookingLink)}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Booking Page
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open: boolean) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details to schedule a customer meeting
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meeting Type *</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            value: "online",
                            label: "Online Meeting",
                            icon: Video,
                          },
                          { value: "call", label: "Phone Call", icon: Phone },
                          {
                            value: "house-visit",
                            label: "House Visit",
                            icon: Home,
                          },
                        ].map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  type: option.value as any,
                                })
                              }
                              className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                                formData.type === option.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                              <span className="text-sm">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="title">Meeting Title *</Label>
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
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Meeting agenda or purpose"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Select
                          value={formData.duration.toString()}
                          onValueChange={(value: string) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.type === "house-visit" && (
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="location">Location Address *</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            placeholder="Enter the address for the house visit"
                            required={formData.type === "house-visit"}
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Customer Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="customerName">Customer Name *</Label>
                          <Input
                            id="customerName"
                            value={formData.customerName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customerName: e.target.value,
                              })
                            }
                            placeholder="Full name"
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
                            placeholder="customer@example.com"
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
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Any additional information or reminders"
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setIsDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          type="button"
                          disabled
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          {editingMeeting
                            ? "Update Meeting"
                            : "Schedule Meeting"}
                        </Button>
                        <p className="text-sm text-gray-500 font-medium">
                          Coming Soon
                        </p>
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {showBookingLink && bookingLink && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  Public Booking Page
                </CardTitle>
                <CardDescription>
                  Share this link with customers so they can book meetings
                  themselves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={bookingLink} readOnly className="bg-white" />
                  <Button
                    variant="outline"
                    onClick={copyBookingLink}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `📅 Book a meeting\n\n${bookingLink}`
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                      toast.success("Opening WhatsApp...");
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                  <Button
                    onClick={() => window.open(bookingLink, "_blank")}
                    variant="outline"
                    className="flex-1"
                  >
                    Preview Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(v: string) => setActiveTab(v as any)}
          >
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="all">All Meetings</TabsTrigger>
              <TabsTrigger value="completed">Past</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                      Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border-0"
                    />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      {selectedDate
                        ? `Meetings for ${selectedDate.toLocaleDateString()}`
                        : "Select a date"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getSelectedDateMeetings().length > 0 ? (
                      <div className="space-y-4">
                        {getSelectedDateMeetings().map((meeting) => (
                          <div
                            key={meeting.id}
                            className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg border border-white/20"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {meeting.title}
                                </h4>
                                {meeting.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {meeting.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {meeting.time} ({meeting.duration} min)
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {getMeetingTypeIcon(meeting.type)}
                                    <span className="capitalize">
                                      {meeting.type.replace("-", " ")}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <User className="w-4 h-4" />
                                  {meeting.customerName} •{" "}
                                  {meeting.customerEmail}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Badge
                                  className={getStatusColor(meeting.status)}
                                >
                                  {meeting.status}
                                </Badge>
                                <Badge
                                  className={getMeetingTypeColor(meeting.type)}
                                >
                                  {getMeetingTypeIcon(meeting.type)}
                                  <span className="ml-1">{meeting.type}</span>
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(meeting)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(meeting.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          No meetings scheduled for this date
                        </p>
                        <Button
                          onClick={() => setIsDialogOpen(true)}
                          className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                          Schedule Meeting
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {getFilteredMeetings().length > 0 && (
                <Card className="mt-6 bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-green-500" />
                      {activeTab === "upcoming"
                        ? "Upcoming Meetings"
                        : activeTab === "completed"
                        ? "Past Meetings"
                        : "All Meetings"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getFilteredMeetings().map((meeting) => (
                        <div
                          key={meeting.id}
                          className="p-3 bg-gradient-to-br from-white/60 to-gray-50/60 rounded-lg border border-white/30 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {meeting.title}
                            </h5>
                            <Badge
                              className={getStatusColor(meeting.status)}
                              size="sm"
                            >
                              {meeting.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(meeting.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meeting.time}
                            </div>
                            <div className="flex items-center gap-1">
                              {getMeetingTypeIcon(meeting.type)}
                              <span className="capitalize">
                                {meeting.type.replace("-", " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {meeting.customerName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
