"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { Building2, Download, Plus, Users, Wrench } from "lucide-react";
import StatCards from "components/admin/halls/StatCards";
import FiltersBar from "components/admin/halls/FiltersBar";
import HallCards from "components/admin/halls/HallCards";
import HallTable from "components/admin/halls/HallTable";
import EditHallModal from "components/admin/halls/ui/EditHallModal";
import ViewHallModal from "components/admin/halls/ui/ViewHallModal";
import { useQueryHalls } from "@queries/halls";

const EMPTY_EDIT = {
  open: false,
  isNew: false,
  id: null,
  name: "",
  description: "",
  capacity: "",
  pricePerHour: "",
  currency: "NPR",
  isActive: true,
  amenitiesInput: "",
  address: "",
  city: "",
  state: "",
  country: "",
  images: [],
  notes: "",
  uploading: false,
  uploadError: null,
};

export default function AdminHallsPage() {
  const [error, setError] = useState(null);
  const [selectedHallId, setSelectedHallId] = useState(null);
  const [filterDraft, setFilterDraft] = useState({ minCapacity: "", maxPrice: "", amenity: "" });
  const [filters, setFilters] = useState({ minCapacity: "", maxPrice: "", amenity: "" });
  
  
  
  const [editModal, setEditModal] = useState(EMPTY_EDIT);
  const [actionLoading, setActionLoading] = useState(false);

  // Use react-query hook for halls list
  const { data: hallsData, isLoading: hallsLoading, error: hallsError, refetch: refetchHalls } = useQueryHalls();

  useEffect(() => {
    if (hallsError) setError(hallsError?.message || "Failed to load halls");
  }, [hallsError]);

  const halls = hallsData?.data?.halls || hallsData?.halls || [];

  // single-hall detail fetching is handled by the ViewHallModal (locality of behavior)

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }),
    [],
  );

  const amenityOptions = useMemo(() => {
    const set = new Set();
    halls.forEach((h) => {
      (h.amenities || []).forEach((a) => {
        if (a) set.add(a);
      });
    });
    return Array.from(set).sort();
  }, [halls]);

  const filteredHalls = useMemo(() => {
    const minCap = Number(filters.minCapacity);
    const maxPrice = Number(filters.maxPrice);

    return halls.filter((h) => {
      const capOk = Number.isFinite(minCap) && minCap > 0 ? Number(h.capacity || 0) >= minCap : true;
      const priceOk = Number.isFinite(maxPrice) && maxPrice > 0 ? Number(h.pricePerHour || 0) <= maxPrice : true;
      const amenityOk = filters.amenity ? (h.amenities || []).includes(filters.amenity) : true;
      return capOk && priceOk && amenityOk;
    });
  }, [filters, halls]);

  const openEditModal = (hall) => {
    if (!hall) return;
    setEditModal({
      ...EMPTY_EDIT,
      open: true,
      isNew: false,
      id: hall._id || hall.id || hall.slug,
      name: hall.name || "",
      description: hall.description || "",
      capacity: hall.capacity ?? "",
      pricePerHour: hall.pricePerHour ?? "",
      currency: hall.currency || "NPR",
      isActive: hall.isActive !== false,
      amenitiesInput: Array.isArray(hall.amenities) ? hall.amenities.join(", ") : "",
      address: hall.location?.address || "",
      city: hall.location?.city || "",
      state: hall.location?.state || "",
      country: hall.location?.country || "",
      images: Array.isArray(hall.images) ? hall.images : [],
      notes: hall.notes || "",
    });
  };

  const openCreateModal = () => {
    setEditModal({
      ...EMPTY_EDIT,
      open: true,
      isNew: true,
      isActive: true,
      currency: "NPR",
    });
  };

  const closeEditModal = () => setEditModal(EMPTY_EDIT);

  const handleImageUpload = async (file) => {
    if (!file) return;
    const ext = `.${file.name.split(".").pop()}`;
    setEditModal((prev) => ({ ...prev, uploading: true, uploadError: null }));
    try {
      const presignRes = await axiosInstance.post(ROUTES.API.ADMIN.HALL_UPLOAD_URL, {
        fileExtension: ext,
        contentType: file.type,
      });
      const uploadData = presignRes.data?.data || {};
      if (!uploadData.uploadUrl || !uploadData.publicUrl) throw new Error("Upload URL not received");

      // Use fetch to PUT directly to the presigned URL (avoids axios attaching extra headers)
      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setEditModal((prev) => ({ ...prev, images: [...prev.images, uploadData.publicUrl] }));
    } catch (err) {
      console.error("Image upload failed", err);
      setEditModal((prev) => ({
        ...prev,
        uploadError: err?.response?.data?.message || err.message || "Upload failed",
      }));
    } finally {
      setEditModal((prev) => ({ ...prev, uploading: false }));
    }
  };

  const removeImage = (url) => {
    setEditModal((prev) => ({ ...prev, images: prev.images.filter((img) => img !== url) }));
  };

  const createHallMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(ROUTES.API.ADMIN.HALLS, payload);
      return res.data;
    },
    onSuccess: async () => {
      await refetchHalls();
      closeEditModal();
    },
    onError: (err) => setError(err?.response?.data?.message || "Failed to update hall"),
  });

  const updateHallMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.patch(ROUTES.API.ADMIN.HALL(id), payload);
      return res.data;
    },
    onSuccess: async () => {
      await refetchHalls();
      closeEditModal();
    },
    onError: (err) => setError(err?.response?.data?.message || "Failed to update hall"),
  });

  const deleteHallMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(ROUTES.API.ADMIN.HALL(id));
      return res.data;
    },
    onSuccess: async () => {
      await refetchHalls();
    },
    onError: (err) => setError(err?.response?.data?.message || "Failed to delete hall"),
  });

  const saveHall = async (formData) => {
    try {
      setActionLoading(true);

      const body = { ...formData };
      body.images = editModal.images;

      if (typeof body.amenitiesInput === "string") {
        body.amenities = body.amenitiesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const cap = Number(body.capacity ?? editModal.capacity);
      if (Number.isFinite(cap) && cap > 0) body.capacity = cap;

      const price = Number(body.pricePerHour ?? editModal.pricePerHour);
      if (Number.isFinite(price) && price >= 0) body.pricePerHour = price;

      // normalize location
      body.location = body.location || {
        address: editModal.address,
        city: editModal.city,
        state: editModal.state,
        country: editModal.country,
      };

      if (editModal.isNew) {
        if (!body.name || !body.capacity) throw new Error("Name and capacity are required");
        await createHallMutation.mutateAsync(body);
      } else {
        await updateHallMutation.mutateAsync({ id: editModal.id, payload: body });
      }
    } catch (err) {
      console.error("Failed to update hall", err);
      setError(err?.response?.data?.message || "Failed to update hall");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (hallId) => {
    const target = halls.find((h) => h._id === hallId || h.id === hallId || h.slug === hallId);
    if (target) openEditModal(target);
  };

  const handleDelete = async (hallId) => {
    if (!hallId) return;
    const ok = typeof window === "undefined" ? true : window.confirm("Delete this hall and related bookings? This cannot be undone.");
    if (!ok) return;
    try {
      setActionLoading(true);
      await deleteHallMutation.mutateAsync(hallId);
    } catch (err) {
      console.error("Failed to delete hall", err);
      setError(err?.response?.data?.message || "Failed to delete hall");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewClick = (hallId) => {
    setSelectedHallId(hallId);
  };

  const closeViewModal = () => {
    setSelectedHallId(null);
  };


  const stats = useMemo(() => {
    const totalHalls = filteredHalls.length;
    const totalCapacity = filteredHalls.reduce((sum, h) => sum + (Number(h.capacity) || 0), 0);
    const inactive = filteredHalls.filter((h) => h.isActive === false).length;

    return [
      { label: "Total Halls", value: String(totalHalls), hint: "", icon: Building2, tone: "positive" },
      { label: "Total Capacity", value: totalCapacity.toLocaleString(), hint: "Across all locations", icon: Users, tone: "neutral" },
      { label: "Maintenance", value: String(inactive), hint: inactive ? "Needs attention" : "All active", icon: Wrench, tone: inactive ? "warning" : "neutral" },
    ];
  }, [filteredHalls]);

  const hallCards = useMemo(() => {
    if (!filteredHalls.length) return [];
    return filteredHalls.slice(0, 9).map((h) => {
      const primaryImage = h.images?.[0] || "https://via.placeholder.com/640x360?text=Hall";
      const city = h.location?.city || "";
      const statusTone = h.isActive === false ? "warning" : "positive";
      const statusLabel = h.isActive === false ? "Inactive" : "Available";
      return {
        id: h._id || h.id,
        name: h.name,
        price: currencyFormatter.format(Number(h.pricePerHour || 0)),
        unit: "/hr",
        status: { label: statusLabel, tone: statusTone },
        location: city || "—",
        capacity: `${h.capacity || 0} Cap`,
        size: h.location?.address || h.slug || "Hall",
        amenities: (h.amenities && h.amenities.length ? h.amenities : ["—"]).slice(0, 4),
        image: primaryImage,
      };
    });
  }, [currencyFormatter, filteredHalls]);

  const tableRows = useMemo(() => {
    if (!filteredHalls.length) return [];
    return filteredHalls.map((h) => {
      const statusTone = h.isActive === false ? "warning" : "positive";
      const statusLabel = h.isActive === false ? "Inactive" : "Active";
      return {
        id: h._id || h.id,
        name: h.name,
        status: { label: statusLabel, tone: statusTone },
        capacity: h.capacity ? String(h.capacity) : "-",
        price: currencyFormatter.format(Number(h.pricePerHour || 0)),
        lastBooked: h.updatedAt ? new Date(h.updatedAt).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "—",
        thumb: h.images?.[0] || "https://via.placeholder.com/160?text=Hall",
      };
    });
  }, [currencyFormatter, filteredHalls]);

  const applyFilters = () => {
    setFilters(filterDraft);
  };

  const clearFilters = () => {
    const empty = { minCapacity: "", maxPrice: "", amenity: "" };
    setFilterDraft(empty);
    setFilters(empty);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Hall Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-8 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Manage Your Halls</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--admin-surface)] border border-white/10 text-white hover:bg-white/5 hover:border-[var(--admin-primary)]/50 transition-colors text-sm font-medium shadow-sm">
                <Download className="size-4" />
                Export Data
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] border border-[var(--admin-primary)] transition-all shadow-lg shadow-[var(--admin-primary)]/30 text-sm font-bold"
              >
                <Plus className="size-4" />
                Add New Hall
              </button>
            </div>
          </div>

          <StatCards stats={stats} />

          {error ? (
            <div className="bg-red-900/40 border border-red-800 text-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>
          ) : null}

          <FiltersBar
            filterDraft={filterDraft}
            setFilterDraft={setFilterDraft}
            amenityOptions={amenityOptions}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
          />

          <HallCards loading={hallsLoading} hallCards={hallCards} onEdit={handleEditClick} onView={handleViewClick} onDelete={handleDelete} actionLoading={actionLoading} />

                  <HallTable
                    loading={hallsLoading}
            rows={tableRows}
            filteredCount={filteredHalls.length}
            onEdit={handleEditClick}
            onView={handleViewClick}
            onDelete={handleDelete}
            actionLoading={actionLoading}
          />
        </div>
      </div>
      <EditHallModal
        editModal={editModal}
        actionLoading={actionLoading}
        onClose={closeEditModal}
        onSave={saveHall}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
      />

      <ViewHallModal
        hallId={selectedHallId}
        currencyFormatter={currencyFormatter}
        closeViewModal={closeViewModal}
        handleEditClick={handleEditClick}
      />
    </div>
  );
}
