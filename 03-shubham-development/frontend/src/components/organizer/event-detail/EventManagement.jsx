import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { Image as ImageIcon, Check, AlertCircle, Globe, Lock, FileText, CheckCircle2, XCircle, Upload, Trash2, X, Grid3x3, Link2, Loader } from "lucide-react";
import { useQueryUserUploads } from "@queries/organizer";
import { USER_UPLOADS_QUERY_KEY } from "@api/organizer/user-uploads-fetcher";
import { RichTextEditor } from "components/shared/RichTextEditor";

// Define allowed status transitions matching backend rules
const ALLOWED_STATUS_TRANSITIONS = {
  "DRAFT": ["PUBLISHED", "CANCELLED"],
  "PUBLISHED": ["DRAFT", "CANCELLED"],
  "CANCELLED": [],
  "PENDING_REVIEW": [],
  "SUSPENDED": []
};

// Function to derive event time range based on booking slot (matches backend logic)
function deriveEventTimeRange(slot) {
  if (slot === "morning") {
    return { startHour: 7, endHour: 12, displayStart: "7:00 AM", displayEnd: "12:00 PM" };
  } else if (slot === "afternoon") {
    return { startHour: 13, endHour: 18, displayStart: "1:00 PM", displayEnd: "6:00 PM" };
  } else if (slot === "evening") {
    return { startHour: 19, endHour: 22, displayStart: "7:00 PM", displayEnd: "10:30 PM" };
  } else if (slot === "wholeday") {
    return { startHour: 7, endHour: 22, displayStart: "7:00 AM", displayEnd: "10:30 PM" };
  }
  return { startHour: 0, endHour: 24, displayStart: "12:00 AM", displayEnd: "12:00 AM" };
}

// Derive datetime based on booking date and slot
function deriveEventDateTime(bookingDate, slot, isStartTime = true) {
  if (!bookingDate || !slot) return null;
  
  const date = new Date(bookingDate);
  const slotRange = deriveEventTimeRange(slot);
  const hour = isStartTime ? slotRange.startHour : slotRange.endHour;
  
  date.setHours(hour, 0, 0, 0);
  
  // Convert to local input format (YYYY-MM-DDTHH:mm)
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventManagement({ event, bookingDate, onSave, isSubmitting }) {
  const [bannerPreview, setBannerPreview] = useState(event?.bannerUrl || "");
  const [bannerError, setBannerError] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageSelectorTab, setImageSelectorTab] = useState("my-uploads"); // "my-uploads", "gallery", "upload", "url"
  const [customImageUrl, setCustomImageUrl] = useState("");

  const queryClient = useQueryClient();
  
  // Fetch user's previously uploaded images using React Query
  const { data: userUploads = [], isLoading: loadingUploads, refetch: refetchUploads } = useQueryUserUploads("banner", {
    enabled: showImageSelector && imageSelectorTab === "my-uploads",
  });

  // Mutation for uploading banner to S3
  const uploadBannerMutation = useMutation({
    mutationFn: async (file) => {
      if (!file) throw new Error("File required");
      if (!event?._id) throw new Error("Event ID required");

      // Step 1: Get presigned upload URL
      const urlRes = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_BANNER_UPLOAD_URL, {
        fileExtension: "." + file.name.split(".").pop(),
        contentType: file.type,
      });
      const { uploadUrl, key: s3Key, publicUrl } = urlRes.data?.data || {};
      
      if (!uploadUrl || !s3Key || !publicUrl) {
        throw new Error("Upload URL not received");
      }

      // Step 2: Upload file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`S3 upload failed: ${uploadRes.status}`);
      }

      // Step 3: Confirm upload in backend and save to event
      const confirmRes = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_BANNER_CONFIRM(event._id), {
        s3Key,
        publicUrl,
      });

      return confirmRes.data?.event || { s3Key, publicUrl };
    },
    onSuccess: (data) => {
      // Update banner preview with confirmed URL
      setBannerPreview(data?.bannerUrl || data?.publicUrl || "");
      setBannerUploading(false);
      setBannerError("");
      toast.success("Banner uploaded successfully");
      // Refetch user uploads to show in gallery
      refetchUploads().catch(() => {});
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message || "Upload failed";
      setBannerError(message);
      setBannerUploading(false);
      toast.error(`❌ Upload failed: ${message}`);
    },
  });

  // Stock event banner images (can be replaced with API call to fetch real images)
  const suggestedImages = [
    { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop", label: "Conference" },
    { url: "https://images.unsplash.com/photo-1519167758481-83f19106ae4f?w=1200&h=400&fit=crop", label: "Business Event" },
    { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop", label: "Workshop" },
    { url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop", label: "Networking" },
    { url: "https://images.unsplash.com/photo-1540575467063-178f50002c4b?w=1200&h=400&fit=crop", label: "Tech Event" },
    { url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop", label: "Wedding" },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: event?.name || "",
      type: event?.type || "",
      description: event?.description || "",
      visibility: event?.isPublic ? "public" : "private",
      accessCode: event?.accessCode || "",
      bannerUrl: event?.bannerUrl || "",
      expectedAttendees: event?.expectedAttendees || null,
      // EVENT TIMES: Auto-derived from booking slot (locked, not editable)
      startDateTime: deriveEventDateTime(event?.bookingId?.date || bookingDate, event?.bookingId?.slot, true) || toLocalInputValue(event?.startDateTime),
      endDateTime: deriveEventDateTime(event?.bookingId?.date || bookingDate, event?.bookingId?.slot, false) || toLocalInputValue(event?.endDateTime),
      // REGISTRATION WINDOW: When tickets can be sold (separate from event time)
      registrationStartDate: event?.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : "", // YYYY-MM-DDTHH:mm
      registrationEndDate: event?.registrationEndDate ? new Date(event.registrationEndDate).toISOString().slice(0, 16) : "", // YYYY-MM-DDTHH:mm
      status: event?.status || "DRAFT",
      cancellationReason: event?.cancellationReason || "",
    },
  });

  const visibility = watch("visibility");
  const status = watch("status");
  const bannerUrl = watch("bannerUrl");
  const registrationStartDate = watch("registrationStartDate");
  const registrationEndDate = watch("registrationEndDate");

  // Validate registration window
  const isRegEndBeforeStart = registrationStartDate && registrationEndDate && new Date(registrationEndDate) < new Date(registrationStartDate);
  
  // Validate event date (booking date)
  const isEventDateInPast = bookingDate && new Date(bookingDate) < new Date();

  // Get slot timing info for display
  const slotTimingInfo = event?.bookingId?.slot ? deriveEventTimeRange(event.bookingId.slot) : null;

  // Update preview when banner URL changes
  if (bannerUrl && bannerUrl !== bannerPreview) {
    setBannerPreview(bannerUrl);
  }

  const handleSave = async (data) => {
    // Validate event date is not in past when publishing
    if (isEventDateInPast && data.status === "PUBLISHED") {
      toast.error("❌ Cannot publish: Event date is in the past");
      return;
    }
    
    // Validate registration window: end date must be after or on start date
    if (data.registrationStartDate && data.registrationEndDate) {
      const regStart = new Date(data.registrationStartDate);
      const regEnd = new Date(data.registrationEndDate);
      if (regEnd < regStart) {
        toast.error("❌ Registration end date must be on or after start date");
        return;
      }
      
      // Registration must end before or on event date
      const eventDate = new Date(event?.bookingId?.date || bookingDate);
      if (regEnd > eventDate) {
        toast.error("❌ Registration must end before or on event date");
        return;
      }
    }
    
    // EVENT TIMES are auto-locked to slot - no manual editing or validation needed
    // Just pass the slot-derived times that were set in defaultValues
    
    await onSave(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ File size must be under 5MB");
      setBannerError("File size must be under 5MB");
      return;
    }

    // Show local preview while uploading
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target?.result);
      setBannerPreview(event.target?.result);
    };
    reader.readAsDataURL(file);

    try {
      setBannerUploading(true);
      setBannerError("");
      
      // Upload to S3
      const { publicUrl } = await uploadBannerMutation.mutateAsync(file);
      
      // Update form with uploaded image
      setValue("bannerUrl", publicUrl, { shouldDirty: true });
      setBannerPreview(publicUrl);
      
      // Refetch user uploads
      await refetchUploads();
      
      toast.success("✅ Banner uploaded successfully!");
      
      // Close upload tab and go to my-uploads
      setImageSelectorTab("my-uploads");
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Upload failed";
      setBannerError(message);
      toast.error(`❌ Upload failed: ${message}`);
      console.error("Upload error:", error);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadPreview(null);
    if (!event?.bannerUrl) {
      setBannerPreview("");
    } else {
      setBannerPreview(event.bannerUrl);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-[#3a1224]/5 p-0 shadow-sm overflow-hidden">
      {/* Header with Status */}
      <div className="bg-gradient-to-r from-[#3a1224] to-[#5a2844] px-8 py-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-[#C0A04C] font-black text-lg">✓</div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider">Manage Event</h3>
            <p className="text-xs text-white/60 mt-1">Update event details, banner, and settings</p>
          </div>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="p-8 space-y-8">

        {/* Section 1: Identity & Content */}
        <div>
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-4 pb-3 border-b border-[#3a1224]/10">Identity & Content</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Event Name *"
                {...register("name", { required: "Name is required" })}
                error={errors.name?.message}
              />
              <FormField 
                label="Category / Type" 
                {...register("type")} 
              />
              <FormField 
                label="Expected Attendees" 
                type="number" 
                inputMode="numeric"
                min="0"
                {...register("expectedAttendees", {
                  setValueAs: (value) => value ? parseInt(value) : null,
                  validate: (value) => {
                    if (value === null || value === undefined || value === "") return true;
                    if (value < 0) return "Cannot be negative";
                    if (value > (event?.hallId?.capacity || 0)) return `Cannot exceed hall capacity (${event?.hallId?.capacity})`;
                    return true;
                  }
                })}
                error={errors.expectedAttendees?.message}
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-3">Description</label>
              <RichTextEditor
                value={watch("description")}
                onChange={(html) => setValue("description", html, { shouldDirty: true })}
                placeholder="Provide detailed description of your event..."
                error={errors.description?.message}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#3a1224]/5" />

        {/* Section 2: Visibility & Access */}
        <div>
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-4 pb-3 border-b border-[#3a1224]/10">Visibility & Access</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-3">Event Visibility</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl cursor-pointer hover:border-[#C0A04C]/30 transition-all">
                  <input type="radio" {...register("visibility")} value="public" className="hidden" />
                  <Globe className={`w-5 h-5 flex-shrink-0 ${visibility === 'public' ? 'text-[#C0A04C]' : 'text-[#3a1224]/30'}`} />
                  <div>
                    <p className="text-sm sm:text-base font-bold text-[#3a1224]">Public</p>
                    <p className="text-xs text-[#3a1224]/50">Everyone can find it</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl cursor-pointer hover:border-[#C0A04C]/30 transition-all">
                  <input type="radio" {...register("visibility")} value="private" className="hidden" />
                  <Lock className={`w-5 h-5 flex-shrink-0 ${visibility === 'private' ? 'text-[#C0A04C]' : 'text-[#3a1224]/30'}`} />
                  <div>
                    <p className="text-sm sm:text-base font-bold text-[#3a1224]">Private</p>
                    <p className="text-xs text-[#3a1224]/50">Access code required</p>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-3">Access Code</label>
              <input
                {...register("accessCode")}
                placeholder="4+ characters required"
                disabled={visibility !== 'private'}
                className={`w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all ${visibility !== 'private' ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#3a1224]/5" />

        {/* Section 3: Banner Image - Professional Grade */}
        <div>
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-6 pb-3 border-b border-[#3a1224]/10">Banner Image Management</p>
          
          {/* Current Banner Preview */}
          {(uploadPreview || event?.bannerUrl) && (
            <div className="mb-6 relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#3a1224]/10 shadow-lg group">
              <img src={uploadPreview || event?.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/40 via-transparent to-transparent" />
              
              {/* Action Overlay */}
              <div className="absolute inset-0 bg-[#3a1224]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowImageSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C0A04C] text-[#3a1224] font-bold rounded-lg hover:bg-[#d4b454] transition-all text-sm"
                >
                  <ImageIcon className="w-4 h-4" />
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={clearUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Quick Select Gallery */}
          <button
            type="button"
            onClick={() => setShowImageSelector(true)}
            className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-[#3a1224] to-[#5a2844] text-white rounded-2xl font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-[#3a1224]/20 transition-all text-sm sm:text-base flex items-center justify-center gap-3"
          >
            <Grid3x3 className="w-5 h-5" />
            {event?.bannerUrl ? 'Change Banner from Gallery' : 'Select Banner Image'}
          </button>

          {/* Info Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <ImageIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-800 font-bold leading-relaxed">
              <p className="font-black mb-1">📐 Perfect Banner Dimensions:</p>
              <ul className="space-y-1 ml-2">
                <li>• 1200×400px (3:1 aspect ratio) • File size under 500KB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* IMAGE SELECTOR MODAL */}
        {showImageSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#3a1224] to-[#5a2844] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">Select Banner Image</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageSelector(false);
                    setImageSelectorTab("my-uploads");
                    setCustomImageUrl("");
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#3a1224]/10 sticky top-16 bg-white z-40 overflow-x-auto">
                {[
                  { id: "my-uploads", label: "My Uploads", icon: ImageIcon },
                  { id: "gallery", label: "Templates", icon: Grid3x3 },
                  { id: "upload", label: "Upload New", icon: Upload },
                  { id: "url", label: "Paste URL", icon: Link2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setImageSelectorTab(id)}
                    className={`flex-shrink-0 px-4 py-3 font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                      imageSelectorTab === id
                        ? "bg-[#3a1224] text-white border-b-2 border-[#C0A04C]"
                        : "text-[#3a1224]/60 hover:text-[#3a1224]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-6">
                {/* My Uploads Tab */}
                {imageSelectorTab === "my-uploads" && (
                  <div>
                    {loadingUploads ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-[#3a1224]/20 border-t-[#C0A04C] rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-[#3a1224]/60 font-bold">Loading your uploads...</p>
                      </div>
                    ) : userUploads.length === 0 ? (
                      <div className="text-center py-12">
                        <ImageIcon className="w-12 h-12 text-[#3a1224]/20 mx-auto mb-3" />
                        <p className="text-sm text-[#3a1224]/60 font-bold mb-2">No uploaded images yet</p>
                        <p className="text-xs text-[#3a1224]/40">Upload your first banner or choose from templates</p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-black text-[#3a1224]/60 uppercase tracking-widest mb-4">Your Uploads</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {userUploads.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setValue("bannerUrl", img.url || img, { shouldDirty: true });
                                setBannerPreview(img.url || img);
                                setShowImageSelector(false);
                                toast.success("Banner image selected!");
                              }}
                              className="group relative aspect-video rounded-xl overflow-hidden border-2 border-[#3a1224]/10 hover:border-[#C0A04C]/60 transition-all hover:shadow-lg"
                            >
                              <img src={img.url || img} alt="User upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-[#3a1224]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Gallery Tab */}
                {imageSelectorTab === "gallery" && (
                  <div>
                    <h4 className="text-sm font-black text-[#3a1224]/60 uppercase tracking-widest mb-4">Template Gallery</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {suggestedImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setValue("bannerUrl", img.url, { shouldDirty: true });
                            setBannerPreview(img.url);
                            setShowImageSelector(false);
                            toast.success("Banner image selected!");
                          }}
                          className="group relative aspect-video rounded-xl overflow-hidden border-2 border-[#3a1224]/10 hover:border-[#C0A04C]/60 transition-all hover:shadow-lg"
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-[#3a1224]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                          <p className="absolute bottom-0 left-0 right-0 text-xs font-bold text-white bg-[#3a1224]/80 px-2 py-1 translate-y-full group-hover:translate-y-0 transition-transform">{img.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Tab */}
                {imageSelectorTab === "upload" && (
                  <div>
                    <label className="relative flex items-center justify-center w-full h-48 border-2 border-dashed border-[#3a1224]/30 rounded-xl bg-gradient-to-br from-[#fdfaf6] to-[#3a1224]/5 cursor-pointer hover:border-[#C0A04C]/60 hover:bg-[#C0A04C]/5 transition-all group">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="text-center pointer-events-none">
                        <div className="w-12 h-12 bg-[#3a1224]/5 group-hover:bg-[#C0A04C]/10 rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors">
                          <Upload className="w-6 h-6 text-[#3a1224]/40 group-hover:text-[#C0A04C]" />
                        </div>
                        <p className="text-sm sm:text-base font-bold text-[#3a1224]/60 group-hover:text-[#3a1224] transition-colors">Drag image here or click to browse</p>
                        <p className="text-xs text-[#3a1224]/40 mt-1">PNG, JPG, WebP • Max 5MB • 1200x400px recommended</p>
                      </div>
                    </label>
                    {uploadPreview && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-[#3a1224]/60 uppercase tracking-wide mb-2">Preview</p>
                        <img src={uploadPreview} alt="Upload preview" className="w-full h-32 object-cover rounded-lg border border-[#C0A04C]" />
                        <button
                          type="button"
                          disabled={uploadBannerMutation.isPending}
                          onClick={() => {
                            setValue("bannerUrl", uploadPreview, { shouldDirty: true });
                            setBannerPreview(uploadPreview);
                            setShowImageSelector(false);
                            setImageSelectorTab("my-uploads");
                          }}
                          className={`w-full mt-3 px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                            uploadBannerMutation.isPending
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-[#C0A04C] text-[#3a1224] hover:bg-[#d4b454]"
                          }`}
                        >
                          {uploadBannerMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                          {uploadBannerMutation.isPending ? "Uploading..." : "Use This Image"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* URL Tab */}
                {imageSelectorTab === "url" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-[#3a1224]/50 uppercase tracking-widest block mb-2">Image URL</label>
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-[#fdfaf6] border border-[#3a1224]/10 rounded-lg px-4 py-3 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/30 outline-none transition-all"
                      />
                      <p className="text-xs text-[#3a1224]/50 font-bold mt-2">💡 Try: Unsplash, Pexels, or Pixabay</p>
                    </div>
                    {customImageUrl && (
                      <div>
                        <p className="text-xs font-bold text-[#3a1224]/60 uppercase tracking-wide mb-2">Preview</p>
                        <img src={customImageUrl} alt="URL preview" className="w-full h-32 object-cover rounded-lg border border-[#3a1224]/10" onError={() => toast.error("Could not load image")} />
                        <button
                          type="button"
                          onClick={() => {
                            setValue("bannerUrl", customImageUrl, { shouldDirty: true });
                            setBannerPreview(customImageUrl);
                            setShowImageSelector(false);
                            setImageSelectorTab("my-uploads");
                            setCustomImageUrl("");
                            toast.success("Banner image added!");
                          }}
                          className="w-full mt-3 px-4 py-2 bg-[#C0A04C] text-[#3a1224] font-bold rounded-lg hover:bg-[#d4b454] transition-all"
                        >
                          Use This Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-[#3a1224]/5" />

        {/* Section 4: Event Time & Registration Window */}
        <div>
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-4 pb-3 border-b border-[#3a1224]/10">Event Time & Registration</p>
          <div className="bg-gradient-to-br from-[#fdfaf6] to-[#f5ede0] border border-[#3a1224]/5 rounded-2xl p-5 space-y-5">
            
            {/* EVENT TIME - READ ONLY (Derived from slot) */}
            <div>
              <p className="text-xs sm:text-sm font-black text-[#3a1224]/60 uppercase tracking-widest mb-3">📅 Actual Event Time (Locked to Booking Slot)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-emerald-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-1">Event Date</p>
                  <p className="text-base sm:text-lg font-black text-emerald-900">
                    {event?.bookingId?.date ? new Date(event.bookingId.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-1">Event Time (Slot)</p>
                  <p className="text-base sm:text-lg font-black text-emerald-900">
                    {slotTimingInfo ? `${slotTimingInfo.displayStart} - ${slotTimingInfo.displayEnd}` : '-'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-emerald-700 mt-2 font-medium italic">This time is automatically locked based on your booking slot and cannot be changed here.</p>
            </div>

            {/* REGISTRATION WINDOW - EDITABLE */}
            <div className="border-t border-[#3a1224]/10 pt-5">
              <p className="text-xs sm:text-sm font-black text-[#3a1224]/60 uppercase tracking-widest mb-3">🎫 Ticket Registration Window</p>
              
              {isRegEndBeforeStart && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-800 font-bold">
                    Registration end date must be on or after start date.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-[#3a1224]/50 uppercase tracking-widest block mb-2">Registration Opens</label>
                  <input
                    type="datetime-local"
                    {...register("registrationStartDate")}
                    className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
                  />
                  <p className="text-xs text-[#3a1224]/50 mt-2 font-medium">
                    Auto-filled with event start time (optional to override)
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-bold text-[#3a1224]/50 uppercase tracking-widest block mb-2">Registration Closes</label>
                  <input
                    type="datetime-local"
                    {...register("registrationEndDate")}
                    className={`w-full bg-[#fdfaf6] border rounded-lg px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 outline-none transition-all ${
                      isRegEndBeforeStart ? 'border-red-400 ring-red-200' : 'border-[#3a1224]/5 ring-[#C0A04C]/20'
                    }`}
                  />
                  <p className="text-xs text-[#3a1224]/50 mt-2 font-medium">
                    {isRegEndBeforeStart ? (
                      <span className="text-red-600 font-bold">❌ Must be after or same as start date</span>
                    ) : (
                      <>Auto-filled with event end time (optional to override)</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#3a1224]/5" />

        {/* Section 5: Publication Status */}
        <div>
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-4 pb-3 border-b border-[#3a1224]/10">Publication Status</p>
          
          {/* Event date info */}
          {bookingDate && (
            <div className={`mb-4 p-4 border rounded-xl flex gap-3 ${
              isEventDateInPast 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isEventDateInPast ? 'text-red-600' : 'text-blue-600'
              }`} />
              <div className={`text-xs sm:text-sm font-bold leading-relaxed ${
                isEventDateInPast ? 'text-red-800' : 'text-blue-800'
              }`}>
                <p className={`font-black mb-1 ${isEventDateInPast ? 'text-red-900' : 'text-blue-900'}`}>
                  Event Date: {new Date(bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {isEventDateInPast ? (
                  <p>❌ This event date is in the past and cannot be published.</p>
                ) : (
                  <p>✓ Ready to be published when registrations open</p>
                )}
              </div>
            </div>
          )}
          
          {/* Current status info */}
          {event?.status === "PENDING_REVIEW" && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-800 font-bold leading-relaxed">
                This event is <span className="text-blue-900 font-black">awaiting admin approval</span> and cannot be modified. You'll be notified once approved or if changes are needed.
              </div>
            </div>
          )}
          
          {event?.status === "SUSPENDED" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-red-800 font-bold leading-relaxed">
                This event is <span className="text-red-900 font-black">suspended</span> and cannot be modified. Contact admin support for more information.
              </div>
            </div>
          )}
          
          <div className={`grid grid-cols-3 gap-3 ${(event?.status === "PENDING_REVIEW" || event?.status === "SUSPENDED") ? 'opacity-50 pointer-events-none' : ''}`}>
            {[
              { value: 'DRAFT', label: 'Draft', Icon: FileText },
              { value: 'PUBLISHED', label: 'Published', Icon: CheckCircle2 },
              { value: 'CANCELLED', label: 'Cancelled', Icon: XCircle }
            ].map((option) => {
              const currentStatus = event?.status || "DRAFT";
              const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
              const isAllowed = allowedTransitions.includes(option.value);
              const isSelected = status === option.value;
              const isDisabled = !isAllowed && status !== option.value;
              
              return (
                <label key={option.value} className={isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}>
                  <input 
                    type="radio" 
                    {...register("status")} 
                    value={option.value} 
                    className="hidden"
                    disabled={isDisabled}
                  />
                  <div className={`px-4 py-4 rounded-xl text-center transition-all font-black text-sm sm:text-base tracking-wider flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'bg-[#3a1224] text-[#C0A04C] shadow-lg shadow-[#3a1224]/20 border-2 border-[#C0A04C]'
                      : isDisabled
                        ? 'bg-[#3a1224]/5 text-[#3a1224]/20 border-2 border-[#3a1224]/10 cursor-not-allowed'
                        : 'bg-[#fdfaf6] text-[#3a1224]/40 border-2 border-[#3a1224]/10 hover:border-[#C0A04C]/30'
                  }`}>
                    <option.Icon className="w-6 h-6" />
                    <div className="text-xs sm:text-sm uppercase">{option.label}</div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Cancellation Reason (shown when status = CANCELLED) */}
          {status === "CANCELLED" && (
            <div className="mt-4 p-4 border border-red-200 rounded-xl bg-red-50">
              <label className="text-xs sm:text-sm font-bold text-red-900 uppercase tracking-widest block mb-2">
                Cancellation Reason (Optional)
              </label>
              <textarea
                {...register("cancellationReason")}
                placeholder="Tell attendees why this event is being cancelled (e.g., unexpected circumstances, venue unavailable, etc.)"
                maxLength={500}
                className="w-full bg-white border border-red-200 rounded-lg px-4 py-3 text-sm font-bold text-[#3a1224] placeholder-[#3a1224]/40 focus:ring-2 ring-red-300/30 outline-none resize-none"
                rows={3}
              />
              <p className="text-xs text-red-700 mt-1">This reason will be included in the cancellation notification sent to all attendees.</p>
            </div>
          )}
          
          {/* Helpful hints */}
          {status === "PUBLISHED" && event?.status === "DRAFT" && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-amber-800 font-bold">Before publishing, ensure you have created ticket types for this event.</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#3a1224]/5" />

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-[#3a1224] to-[#5a2844] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#3a1224]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              '✓ Save Changes'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function FormField({ label, error, disabled, ...props }) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-2">{label}</label>
      <input
        {...props}
        disabled={disabled}
        className={`w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none ${disabled ? 'opacity-30' : ''}`}
      />
      {error && <p className="text-xs sm:text-sm text-rose-500 font-bold mt-1">{error}</p>}
    </div>
  );
}

function toLocalInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
