import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { AlertCircle, Check, CheckCircle2, FileText, Globe, Grid3x3, Image as ImageIcon, Link2, Loader, Lock, Trash2, Upload, X, XCircle } from "lucide-react";
import { useQueryUserUploads } from "@queries/organizer";
import { USER_UPLOADS_QUERY_KEY } from "@api/organizer/user-uploads-fetcher";
import { RichTextEditor } from "components/shared/RichTextEditor";

const ALLOWED_STATUS_TRANSITIONS = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["DRAFT", "CANCELLED"],
  CANCELLED: [],
  PENDING_REVIEW: [],
  SUSPENDED: [],
};

function deriveEventTimeRange(slot) {
  if (slot === "morning") return { startHour: 7, endHour: 12, displayStart: "7:00 AM", displayEnd: "12:00 PM" };
  if (slot === "afternoon") return { startHour: 13, endHour: 18, displayStart: "1:00 PM", displayEnd: "6:00 PM" };
  if (slot === "evening") return { startHour: 19, endHour: 22, displayStart: "7:00 PM", displayEnd: "10:30 PM" };
  if (slot === "wholeday") return { startHour: 7, endHour: 22, displayStart: "7:00 AM", displayEnd: "10:30 PM" };
  return { startHour: 0, endHour: 24, displayStart: "12:00 AM", displayEnd: "12:00 AM" };
}

function deriveEventDateTime(bookingDate, slot, isStartTime = true) {
  if (!bookingDate || !slot) return null;
  const date = new Date(bookingDate);
  const slotRange = deriveEventTimeRange(slot);
  const hour = isStartTime ? slotRange.startHour : slotRange.endHour;
  date.setHours(hour, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export function EventManagement({ event, bookingDate, onSave, isSubmitting }) {
  const [bannerPreview, setBannerPreview] = useState(event?.bannerUrl || "");
  const [bannerError, setBannerError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageSelectorTab, setImageSelectorTab] = useState("my-uploads");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const queryClient = useQueryClient();

  const { data: userUploads = [], isLoading: loadingUploads, refetch: refetchUploads } = useQueryUserUploads("banner", {
    enabled: showImageSelector && imageSelectorTab === "my-uploads",
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async (file) => {
      if (!file) throw new Error("File required");
      if (!event?._id) throw new Error("Event ID required");
      const urlRes = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_BANNER_UPLOAD_URL, {
        fileExtension: "." + file.name.split(".").pop(),
        contentType: file.type,
      });
      const { uploadUrl, key: s3Key, publicUrl } = urlRes.data?.data || {};
      if (!uploadUrl || !s3Key || !publicUrl) throw new Error("Upload URL not received");
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);
      const confirmRes = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_BANNER_CONFIRM(event._id), { s3Key, publicUrl });
      return confirmRes.data?.event || { s3Key, publicUrl };
    },
    onSuccess: (data) => {
      const nextUrl = data?.bannerUrl || data?.publicUrl || "";
      setValue("bannerUrl", nextUrl, { shouldDirty: true });
      setBannerPreview(nextUrl);
      setBannerError("");
      queryClient.invalidateQueries({ queryKey: USER_UPLOADS_QUERY_KEY });
      refetchUploads().catch(() => {});
      toast.success("Banner uploaded");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message || "Upload failed";
      setBannerError(message);
      toast.error(`Upload failed: ${message}`);
    },
  });

  const suggestedImages = [
    { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop", label: "Conference" },
    { url: "https://images.unsplash.com/photo-1519167758481-83f19106ae4f?w=1200&h=400&fit=crop", label: "Business event" },
    { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop", label: "Workshop" },
    { url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop", label: "Networking" },
    { url: "https://images.unsplash.com/photo-1540575467063-178f50002c4b?w=1200&h=400&fit=crop", label: "Talk" },
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
      startDateTime: deriveEventDateTime(event?.bookingId?.date || bookingDate, event?.bookingId?.slot, true) || toLocalInputValue(event?.startDateTime),
      endDateTime: deriveEventDateTime(event?.bookingId?.date || bookingDate, event?.bookingId?.slot, false) || toLocalInputValue(event?.endDateTime),
      registrationStartDate: event?.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : "",
      registrationEndDate: event?.registrationEndDate ? new Date(event.registrationEndDate).toISOString().slice(0, 16) : "",
      status: event?.status || "DRAFT",
      cancellationReason: event?.cancellationReason || "",
    },
  });

  const visibility = watch("visibility");
  const status = watch("status");
  const bannerUrl = watch("bannerUrl");
  const registrationStartDate = watch("registrationStartDate");
  const registrationEndDate = watch("registrationEndDate");
  const slotTimingInfo = event?.bookingId?.slot ? deriveEventTimeRange(event.bookingId.slot) : null;
  const isRegEndBeforeStart = registrationStartDate && registrationEndDate && new Date(registrationEndDate) < new Date(registrationStartDate);
  const isEventDateInPast = bookingDate && new Date(bookingDate) < new Date();
  const isLockedStatus = event?.status === "PENDING_REVIEW" || event?.status === "SUSPENDED";

  useEffect(() => {
    if (bannerUrl && bannerUrl !== bannerPreview) setBannerPreview(bannerUrl);
  }, [bannerUrl, bannerPreview]);

  const handleSave = async (data) => {
    if (isEventDateInPast && data.status === "PUBLISHED") {
      toast.error("Cannot publish: event date is in the past");
      return;
    }
    if (data.registrationStartDate && data.registrationEndDate) {
      const regStart = new Date(data.registrationStartDate);
      const regEnd = new Date(data.registrationEndDate);
      if (regEnd < regStart) {
        toast.error("Registration end date must be on or after start date");
        return;
      }
      const eventDate = new Date(event?.bookingId?.date || bookingDate);
      if (regEnd > eventDate) {
        toast.error("Registration must end before or on event date");
        return;
      }
    }
    await onSave(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = async (inputEvent) => {
    const file = inputEvent.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      setBannerError("File size must be under 5MB");
      toast.error("File size must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target?.result);
      setBannerPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
    await uploadBannerMutation.mutateAsync(file);
    setImageSelectorTab("my-uploads");
  };

  const selectBanner = (url, message = "Banner selected") => {
    setValue("bannerUrl", url, { shouldDirty: true });
    setBannerPreview(url);
    setShowImageSelector(false);
    setCustomImageUrl("");
    toast.success(message);
  };

  const clearBanner = () => {
    setUploadPreview(null);
    setBannerPreview("");
    setValue("bannerUrl", "", { shouldDirty: true });
  };

  return (
    <section className="border border-[#e8dcc8] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#e8dcc8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black text-[#3a1224]">Manage event</h2>
          <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">Update the public listing, registration window, and publication status.</p>
        </div>
        {saveSuccess && (
          <span className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-6 p-5">
        <Panel title="Identity and content" description="Core details shown on the public event page.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Event name" {...register("name", { required: "Name is required" })} error={errors.name?.message} />
            <FormField label="Category / type" {...register("type")} />
            <FormField
              label="Expected attendees"
              type="number"
              inputMode="numeric"
              min="0"
              {...register("expectedAttendees", {
                setValueAs: (value) => (value ? parseInt(value) : null),
                validate: (value) => {
                  if (value === null || value === undefined || value === "") return true;
                  if (value < 0) return "Cannot be negative";
                  if (event?.hallId?.capacity && value > event.hallId.capacity) return `Cannot exceed hall capacity (${event.hallId.capacity})`;
                  return true;
                },
              })}
              error={errors.expectedAttendees?.message}
            />
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Description</label>
            <RichTextEditor
              value={watch("description")}
              onChange={(html) => setValue("description", html, { shouldDirty: true })}
              placeholder="Describe the event, who it is for, and what guests should expect."
              error={errors.description?.message}
            />
          </div>
        </Panel>

        <Panel title="Access" description="Control whether the event is publicly discoverable.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <VisibilityOption register={register} value="public" active={visibility === "public"} icon={Globe} title="Public" note="Visible in event discovery." />
              <VisibilityOption register={register} value="private" active={visibility === "private"} icon={Lock} title="Private" note="Guests need an access code." />
            </div>
            <FormField label="Access code" {...register("accessCode")} disabled={visibility !== "private"} placeholder="4+ characters for private events" />
          </div>
        </Panel>

        <Panel title="Banner image" description="Use a clear venue or event image. Avoid text-heavy artwork.">
          {bannerPreview ? (
            <div className="overflow-hidden border border-[#e8dcc8] bg-[#fbf8f2]">
              <img src={bannerPreview} alt="Banner preview" className="h-48 w-full object-cover sm:h-56" />
              <div className="flex flex-wrap gap-2 border-t border-[#e8dcc8] p-3">
                <button type="button" onClick={() => setShowImageSelector(true)} className="inline-flex h-9 items-center gap-2 border border-[#e8dcc8] bg-white px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2]">
                  <Grid3x3 className="h-3.5 w-3.5" />
                  Change image
                </button>
                <button type="button" onClick={clearBanner} className="inline-flex h-9 items-center gap-2 border border-red-200 bg-white px-3 text-xs font-bold text-red-700 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowImageSelector(true)} className="flex h-28 w-full items-center justify-center gap-2 border border-dashed border-[#e8dcc8] bg-[#fbf8f2] text-sm font-bold text-[#3a1224]/60 hover:bg-white">
              <ImageIcon className="h-4 w-4" />
              Select banner image
            </button>
          )}
          {bannerError && <p className="mt-2 text-sm font-bold text-red-600">{bannerError}</p>}
        </Panel>

        <Panel title="Schedule and registration" description="Event time is locked to the venue booking; registration can be adjusted.">
          <div className="grid gap-3 md:grid-cols-2">
            <ReadOnlyBlock label="Event date" value={event?.bookingId?.date ? formatDateTime(event.bookingId.date) : "-"} />
            <ReadOnlyBlock label="Booking slot" value={slotTimingInfo ? `${slotTimingInfo.displayStart} - ${slotTimingInfo.displayEnd}` : "-"} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Registration opens" type="datetime-local" {...register("registrationStartDate")} />
            <FormField label="Registration closes" type="datetime-local" {...register("registrationEndDate")} error={isRegEndBeforeStart ? "Must be after opening date" : undefined} />
          </div>
        </Panel>

        <Panel title="Publication status" description="Move the event through draft, published, and cancellation states.">
          {bookingDate && (
            <div className={`mb-4 flex gap-3 border p-4 ${isEventDateInPast ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
              <AlertCircle className={`mt-0.5 h-5 w-5 shrink-0 ${isEventDateInPast ? "text-red-600" : "text-blue-600"}`} />
              <div className={`text-sm leading-6 ${isEventDateInPast ? "text-red-800" : "text-blue-800"}`}>
                <p className="font-black">Event date: {formatDateTime(bookingDate)}</p>
                <p>{isEventDateInPast ? "This event date is in the past and cannot be published." : "Event can be published once content and tickets are ready."}</p>
              </div>
            </div>
          )}

          {isLockedStatus && (
            <div className="mb-4 border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
              This event is {event.status === "SUSPENDED" ? "suspended" : "awaiting admin approval"} and cannot be modified right now.
            </div>
          )}

          <div className={`grid gap-3 sm:grid-cols-3 ${isLockedStatus ? "pointer-events-none opacity-50" : ""}`}>
            {[
              { value: "DRAFT", label: "Draft", Icon: FileText },
              { value: "PUBLISHED", label: "Published", Icon: CheckCircle2 },
              { value: "CANCELLED", label: "Cancelled", Icon: XCircle },
            ].map((option) => {
              const currentStatus = event?.status || "DRAFT";
              const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
              const isAllowed = allowedTransitions.includes(option.value);
              const isSelected = status === option.value;
              const isDisabled = !isAllowed && status !== option.value;
              return (
                <label key={option.value} className={isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}>
                  <input type="radio" {...register("status")} value={option.value} className="hidden" disabled={isDisabled} />
                  <div className={`flex items-center gap-2 border px-4 py-3 text-sm font-black ${isSelected ? "border-[#3a1224] bg-[#3a1224] text-white" : "border-[#e8dcc8] bg-white text-[#3a1224]/60 hover:bg-[#fbf8f2]"}`}>
                    <option.Icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </label>
              );
            })}
          </div>

          {status === "CANCELLED" && (
            <div className="mt-4 border border-red-200 bg-red-50 p-4">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-red-800">Cancellation reason</label>
              <textarea
                {...register("cancellationReason")}
                placeholder="Explain why the event is being cancelled."
                maxLength={500}
                rows={3}
                className="w-full resize-none border border-red-200 bg-white px-3 py-2 text-sm font-bold text-[#3a1224] outline-none"
              />
              <p className="mt-2 text-xs text-red-700">This reason is included in attendee notifications.</p>
            </div>
          )}
        </Panel>

        <div className="flex justify-end border-t border-[#e8dcc8] pt-5">
          <button type="submit" disabled={isSubmitting} className="h-11 bg-[#3a1224] px-6 text-sm font-bold text-white hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Updating..." : "Save changes"}
          </button>
        </div>
      </form>

      {showImageSelector && (
        <ImageSelectorModal
          activeTab={imageSelectorTab}
          setActiveTab={setImageSelectorTab}
          onClose={() => setShowImageSelector(false)}
          userUploads={userUploads}
          loadingUploads={loadingUploads}
          suggestedImages={suggestedImages}
          onSelect={selectBanner}
          onUpload={handleFileUpload}
          uploadPreview={uploadPreview}
          uploading={uploadBannerMutation.isPending}
          customImageUrl={customImageUrl}
          setCustomImageUrl={setCustomImageUrl}
        />
      )}
    </section>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="border border-[#e8dcc8]">
      <div className="border-b border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3">
        <h3 className="text-sm font-black text-[#3a1224]">{title}</h3>
        {description && <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">{description}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function FormField({ label, error, disabled, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</span>
      <input
        {...props}
        disabled={disabled}
        className={`h-11 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15 ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
      />
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

function ReadOnlyBlock({ label, value }) {
  return (
    <div className="border border-[#e8dcc8] bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</p>
      <p className="mt-1 text-sm font-black text-[#3a1224]">{value}</p>
    </div>
  );
}

function VisibilityOption({ register, value, active, icon: Icon, title, note }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 border px-4 py-3 ${active ? "border-[#3a1224] bg-[#fbf8f2]" : "border-[#e8dcc8] bg-white"}`}>
      <input type="radio" {...register("visibility")} value={value} className="mt-1" />
      <Icon className="mt-0.5 h-4 w-4 text-[#3a1224]/50" />
      <span>
        <span className="block text-sm font-black text-[#3a1224]">{title}</span>
        <span className="mt-1 block text-xs text-[#3a1224]/45">{note}</span>
      </span>
    </label>
  );
}

function ImageSelectorModal({
  activeTab,
  setActiveTab,
  onClose,
  userUploads,
  loadingUploads,
  suggestedImages,
  onSelect,
  onUpload,
  uploadPreview,
  uploading,
  customImageUrl,
  setCustomImageUrl,
}) {
  const tabs = [
    { id: "my-uploads", label: "Uploads" },
    { id: "gallery", label: "Gallery" },
    { id: "upload", label: "Upload" },
    { id: "url", label: "URL" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[86vh] w-full max-w-4xl overflow-y-auto bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8dcc8] bg-white px-5 py-4">
          <div>
            <h3 className="text-base font-black text-[#3a1224]">Select banner image</h3>
            <p className="mt-1 text-xs text-[#3a1224]/45">Recommended size: 1200x400px.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center border border-[#e8dcc8] text-[#3a1224]/55 hover:bg-[#fbf8f2]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-[#e8dcc8] px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`h-9 border px-3 text-xs font-bold ${activeTab === tab.id ? "border-[#3a1224] bg-[#3a1224] text-white" : "border-[#e8dcc8] bg-white text-[#3a1224]/60 hover:bg-[#fbf8f2]"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {activeTab === "my-uploads" && (
            loadingUploads ? (
              <p className="text-sm font-bold text-[#3a1224]/45">Loading uploads...</p>
            ) : userUploads.length > 0 ? (
              <ImageGrid images={userUploads.map((upload) => ({ url: upload.url || upload.publicUrl, label: upload.originalName || "Upload" }))} onSelect={onSelect} />
            ) : (
              <div className="border border-dashed border-[#e8dcc8] bg-[#fbf8f2] p-8 text-center">
                <p className="text-sm font-bold text-[#3a1224]">No uploaded banners yet</p>
                <p className="mt-1 text-xs text-[#3a1224]/45">Use the upload tab to add your first image.</p>
              </div>
            )
          )}

          {activeTab === "gallery" && <ImageGrid images={suggestedImages} onSelect={onSelect} />}

          {activeTab === "upload" && (
            <div className="space-y-4">
              <label className="flex h-44 cursor-pointer items-center justify-center border border-dashed border-[#e8dcc8] bg-[#fbf8f2] hover:bg-white">
                <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
                <span className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-[#3a1224]/40" />
                  <span className="mt-2 block text-sm font-bold text-[#3a1224]/60">Choose an image file</span>
                  <span className="mt-1 block text-xs text-[#3a1224]/40">PNG, JPG, WebP. Max 5MB.</span>
                </span>
              </label>
              {uploadPreview && (
                <div className="border border-[#e8dcc8]">
                  <img src={uploadPreview} alt="Upload preview" className="h-36 w-full object-cover" />
                  <div className="border-t border-[#e8dcc8] p-3 text-sm font-bold text-[#3a1224]/60">
                    {uploading ? <span className="inline-flex items-center gap-2"><Loader className="h-4 w-4 animate-spin" /> Uploading...</span> : "Uploaded image preview"}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Image URL</span>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(event) => setCustomImageUrl(event.target.value)}
                  placeholder="https://..."
                  className="h-11 w-full border border-[#e8dcc8] bg-white px-3 text-sm font-bold text-[#3a1224] outline-none focus:border-[#C0A04C]"
                />
              </label>
              {customImageUrl && (
                <div className="border border-[#e8dcc8]">
                  <img src={customImageUrl} alt="URL preview" className="h-40 w-full object-cover" onError={() => toast.error("Could not load image")} />
                  <div className="border-t border-[#e8dcc8] p-3">
                    <button type="button" onClick={() => onSelect(customImageUrl, "Banner image added")} className="h-10 bg-[#3a1224] px-4 text-sm font-bold text-white hover:bg-[#4b1830]">
                      Use this image
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageGrid({ images, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => {
        const url = image.url || image.publicUrl;
        if (!url) return null;
        return (
          <button key={`${url}-${index}`} type="button" onClick={() => onSelect(url)} className="group overflow-hidden border border-[#e8dcc8] bg-white text-left hover:border-[#C0A04C]">
            <img src={url} alt={image.label || "Banner option"} className="h-28 w-full object-cover" />
            <div className="flex items-center justify-between px-3 py-2">
              <span className="truncate text-xs font-bold text-[#3a1224]/65">{image.label || "Banner"}</span>
              <Link2 className="h-3.5 w-3.5 text-[#3a1224]/30 group-hover:text-[#3a1224]" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
