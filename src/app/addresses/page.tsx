"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { UserAddressService } from "@/src/lib/services/userAddress";
import AddressFormModal from "../../components/AddressFormModal";

interface UserAddress {
  _id?: string;
  name?: string;
  addLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  mobileNumber?: string;
  mobileNumberCode?: string;
  default?: boolean;
}

export default function AddressesPage() {
  const t = useTranslations();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await UserAddressService.getAddresses();
      const data = (res as any)?.data?.data || (res as any)?.data || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this address?")) return;

    try {
      await UserAddressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success("Address deleted");
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  /* ---------------- Set Default ---------------- */
  const handleSetDefault = async (id?: string) => {
    if (!id) return;

    try {
      await UserAddressService.setDefaultAddress(id);

      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          default: a._id === id,
        }))
      );

      toast.success("Default address updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update default");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("savedAddresses")}</h1>
            <p className="text-sm text-gray-500">
              Manage your delivery addresses
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition"
          >
            <Plus size={16} />
            {t("addAddress")}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
          </div>
        ) : addresses.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">{t("noAddressFound")}</p>
            <button
              onClick={() => setOpenModal(true)}
              className="rounded-xl bg-yellow-400 px-6 py-2 font-medium hover:bg-yellow-500"
            >
              {t("addAddress")}
            </button>
          </div>
        ) : (
          /* Address Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm transition ${
                  address.default
                    ? "border-yellow-400 ring-2 ring-yellow-100"
                    : "border-gray-200"
                }`}
              >
                {address.default && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 text-xs font-medium text-yellow-600">
                    <CheckCircle size={14} />
                    Default
                  </span>
                )}

                <h3 className="font-semibold mb-2">{address.name}</h3>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>{address.addLine1}</p>
                  <p>
                    {address.city}, {address.state} {address.pincode}
                  </p>
                  <p>{address.country}</p>
                  <p>
                    +{address.mobileNumberCode} {address.mobileNumber}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  {!address.default && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="text-yellow-600 font-medium hover:underline"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditing(address);
                      setOpenModal(true);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(address._id)}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Modal */}
      <AddressFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchAddresses}
        editing={editing}
      />
    </div>
  );
}
