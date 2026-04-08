import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { Image as ImageIcon, Check, AlertCircle, Globe, Lock, FileText, CheckCircle2, XCircle, Upload, Trash2 } from "lucide-react";

// Define allowed status transitions matching backend rules
const ALLOWED_STATUS_TRANSITIONS = {
  "DRAFT": ["PUBLISHED", "CANCELLED"],
  "PUBLISHED": ["DRAFT", "CANCELLED"],
  "CANCELLED": [],
  "PENDING_REVIEW": [],
  "SUSPENDED": []
};

export function EventManagement({ event, bookingDate, onSave, isSubmitting }) {
  const [bannerPreview, setBannerPreview] = useState(event?.bannerUrl || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: event?.name || "",
      type: event?.type || "",
      description: event?.description || "",
      visibility: event?.isPublic ? "public" : "private",
      accessCode: event?.accessCode || "",
      bannerUrl: event?.bannerUrl || "",
      startDateTime: toLocalInputValue(event?.startDateTime),
      endDateTime: toLocalInputValue(event?.endDateTime),
      status: event?.status || "DRAFT",
      cancellationReason: event?.cancellationReason || "",
    },
  });

  const visibility = watch("visibility");
  const status = watch("status");
  const bannerUrl = watch("bannerUrl");
  const startDateTime = watch("startDateTime");
  const endDateTime = watch("endDateTime");

  // Validate registration window
  const isEndBeforeStart = startDateTime && endDateTime && new Date(endDateTime) <= new Date(startDateTime);
  
  // Validate event date (booking date)
  const isEventDateInPast = bookingDate && new Date(bookingDate) < new Date();

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
    
    // Validate registration window: end must be after start
    if (data.startDateTime && data.endDateTime) {
      const startDate = new Date(data.startDateTime);
      const endDate = new Date(data.endDateTime);
      if (endDate <= startDate) {
        toast.error("❌ Registration end time must be after start time");
        return;
      }
    }
    
    await onSave(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadPreview(event.target?.result);
        // Optionally set as banner preview
        setBannerPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
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
              <FormField label="Category / Type" {...register("type")} />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-3">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Provide detailed description of your event..."
                className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none resize-none"
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
          
          {/* Before/After Comparison */}
          {(uploadPreview || event?.bannerUrl) && (
            <div className="mb-6 bg-gradient-to-br from-[#3a1224]/5 to-[#C0A04C]/5 border border-[#3a1224]/10 rounded-2xl p-6">
              <p className="text-xs sm:text-sm font-bold text-[#3a1224]/60 uppercase tracking-widest mb-4">Preview Comparison</p>
              <div className={`grid gap-4 ${uploadPreview && event?.bannerUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {event?.bannerUrl && (
                  <div>
                    <div className="text-xs text-[#3a1224]/50 uppercase tracking-wider mb-2 px-1">Current</div>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-[#3a1224]/10 shadow-sm">
                      <img src={event.bannerUrl} alt="Current banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/20 to-transparent" />
                    </div>
                  </div>
                )}
                {uploadPreview && (
                  <div>
                    <div className="text-xs text-[#C0A04C] uppercase tracking-wider mb-2 px-1">✓ New</div>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-[#C0A04C]/50 shadow-md ring-2 ring-[#C0A04C]/20">
                      <img src={uploadPreview} alt="New banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/20 to-transparent" />
                      <button
                        type="button"
                        onClick={clearUpload}
                        className="absolute top-2 right-2 p-1.5 bg-[#3a1224]/80 hover:bg-[#3a1224] rounded-lg text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload/Input Methods */}
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-3">1. Upload Image File</label>
              <label className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-[#3a1224]/30 rounded-xl bg-gradient-to-br from-[#fdfaf6] to-[#3a1224]/5 cursor-pointer hover:border-[#C0A04C]/60 hover:bg-[#C0A04C]/5 transition-all group">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="text-center pointer-events-none">
                  <div className="w-10 h-10 bg-[#3a1224]/5 group-hover:bg-[#C0A04C]/10 rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors">
                    <Upload className="w-6 h-6 text-[#3a1224]/40 group-hover:text-[#C0A04C]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#3a1224]/60 group-hover:text-[#3a1224] transition-colors">Drag image here or click to browse</p>
                  <p className="text-xs text-[#3a1224]/40 mt-1">PNG, JPG, WebP • Max 5MB • 1200x400px recommended</p>
                </div>
              </label>
            </div>

            {/* URL Input */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#3a1224]/40 uppercase tracking-widest block mb-3">2. Or Paste Image URL</label>
              <input
                {...register("bannerUrl")}
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-gradient-to-r from-[#fdfaf6] to-[#3a1224]/5 border border-[#3a1224]/10 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/30 outline-none transition-all"
              />
              <p className="text-xs text-[#3a1224]/50 font-bold mt-2">💡 Tip: Try Unsplash, Pexels, or Pixabay for free stock images</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <ImageIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-800 font-bold leading-relaxed">
              <p className="font-black mb-1">Perfect Banner Guidelines:</p>
              <ul className="space-y-1 ml-2">
                <li>• Dimensions: 1200×400px (3:1 aspect ratio)</li>
                <li>• Focus content in center area (20% margins)</li>
                <li>• File size under 500KB for faster loading</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#3a1224]/5" />

        {/* Section 4: Registration Timeline */}
        <div>
          <p className="text-sm sm:text-base font-bold text-[#3a1224]/40 uppercase tracking-widest mb-4 pb-3 border-b border-[#3a1224]/10">Registration Window</p>
          <div className="bg-gradient-to-br from-[#fdfaf6] to-[#f5ede0] border border-[#3a1224]/5 rounded-2xl p-5">
            {/* Validation warning */}
            {isEndBeforeStart && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-red-800 font-bold">
                  Registration end time must be after start time.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#3a1224]/50 uppercase tracking-widest block mb-2">Start Registration</label>
                <input
                  type="datetime-local"
                  {...register("startDateTime")}
                  className={`w-full bg-white border rounded-lg px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 outline-none transition-all ${
                    isEndBeforeStart ? 'border-red-400 ring-red-200' : 'border-[#3a1224]/5 ring-[#C0A04C]/20'
                  }`}
                />
                <p className="text-xs text-[#3a1224]/50 mt-2 font-medium">When registrations open</p>
                {event?.bookingId?.date && (
                  <p className="text-xs text-[#3a1224]/50 mt-1 font-medium">Before: {new Date(event.bookingId.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#3a1224]/50 uppercase tracking-widest block mb-2">End Registration</label>
                <input
                  type="datetime-local"
                  {...register("endDateTime")}
                  className={`w-full bg-white border rounded-lg px-4 py-3 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-2 outline-none transition-all ${
                    isEndBeforeStart ? 'border-red-400 ring-red-200' : 'border-[#3a1224]/5 ring-[#C0A04C]/20'
                  }`}
                />
                <p className="text-xs text-[#3a1224]/50 mt-2 font-medium">
                  {isEndBeforeStart ? (
                    <span className="text-red-600 font-bold">❌ Must be after start time</span>
                  ) : (
                    <>When registrations close</>
                  )}
                </p>
                {event?.bookingId?.date && (
                  <p className="text-xs text-[#3a1224]/50 mt-1 font-medium">Before: {new Date(event.bookingId.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
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
