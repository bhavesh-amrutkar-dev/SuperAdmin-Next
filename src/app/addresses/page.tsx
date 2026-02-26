"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";

import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { UserAddressService } from "@/src/lib/services/userAddress";
import AddressFormModal from "../../components/AddressFormModal";
import { Button } from "@/src/components/ui/button";
import { ConfirmationModal } from "@/src/components/ui/confirmationModal";
import { useProfile } from "@/src/lib/hooks/userProfile";
import { useRouter } from "next/navigation";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // const { user } = useProfile();
  const router = useRouter();
  useEffect(() => {
    fetchAddresses();
  }, []);
  // useEffect(() => {
  //     console.log(user);
  //   if (user === undefined) return; // still loading profile
  //   console.log(user);
  //   if (!user) {
  //     router.replace("/auth/login");
  //   }
  // }, [user, router]);
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await UserAddressService.getAddresses();
      const data = (res as any)?.data?.data || (res as any)?.data || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || t("loadAddressesFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Delete ---------------- */
  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      setConfirmLoading(true);
      await UserAddressService.deleteAddress(selectedId);
      setAddresses((prev) => prev.filter((a) => a._id !== selectedId));
      toast.success(t("addressDeleted"));
      setConfirmOpen(false);
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err?.message || t("deleteFailed"));
    } finally {
      setConfirmLoading(false);
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

      toast.success(t("defaultAddressUpdated"));
    } catch (err: any) {
      toast.error(err?.message || t("defaultUpdateFailed"));
    }
  };

  return (
    <>
      <ConfirmationModal
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={confirmLoading}
        variant="destructive"
        title={t("deleteAddress")}
        message={t("deleteAddressConfirm")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t("savedAddresses")}</h1>
              <p className="text-sm text-gray-500">{t("manageDeliveryAddresses")}</p>
            </div>

            <Button
              className="btn-primary"
              variant="primary"
              size="default"
              onClick={() => {
                setEditing(null);
                setOpenModal(true);
              }}
            >
              <Plus size={16} />
              {t("addAddress")}
            </Button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            </div>
          ) : addresses.length === 0 ? (
            /* Empty */
            <div className="rounded-2xl border border-gray-200 bg-gray-100 p-12 text-center">
              <p className="text-[#2f2f2f] mb-4 font-semibold">{t("noAddressFound")}</p>
              <Button className="btn-primary" variant="primary" onClick={() => setOpenModal(true)}>
                <Plus size={16} />
                {t("addAddress")}
              </Button>
            </div>
          ) : (
            /* Address Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`relative rounded-2xl border bg-white p-6 shadow-sm transition ${address.default
                    ? "border-yellow-400 ring-2 ring-yellow-100"
                    : "border-gray-200"
                    }`}
                >
                  {address.default && (
                    <span className="absolute right-4 top-4 flex items-center gap-1 text-xs font-medium text-yellow-600">
                      <CheckCircle size={14} />
                      {t("default")}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                      >
                        {t("setDefault")}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.warning(t("comingSoon"))}
                    >
                      <Pencil size={14} />
                      {t("edit")}
                    </Button>

                    <Button
                      variant="destructiveOutline"
                      size="sm"
                      onClick={() => {
                        setSelectedId(address._id || null);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 size={14} />
                      {t("delete")}
                    </Button>
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
    </>
  );
}