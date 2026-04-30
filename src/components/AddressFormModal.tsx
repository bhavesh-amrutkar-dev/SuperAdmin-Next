"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { UserAddressService } from "@/src/lib/services/userAddress";
import { AuthService } from "../lib/services/auth";
import AddressForm, { AddressFormRM } from "./addressForm";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "../lib/utils/errorMessage";

export default function AddressFormModal({
  open,
  onClose,
  onSuccess,
  editing,
}: any) {
  const t = useTranslations();
  const handleSubmit = async (data: AddressFormRM) => {
    try {
      // 🚨 Ensure countryId exists
      if (!data.countryId) {
        toast.error("Please select a country");
        return;
      }

      const payload = {
        // ✅ name
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),

        // ✅ address (FIXED)
        addLine1: data.addLine1, // ✅ DO NOT OVERRIDE
        city: data.city,
        state: data.state,
        country: data.country,
        countryId: data.countryId,

        pincode: data.pincode,
        landmark: data.landmark,

        // ✅ mobile
        mobileNumber: data.mobileNumber?.trim(),
        mobileNumberCode: data.mobileNumberCode,
        mobileNumberSortCode: data.mobileNumberSortCode?.toLowerCase(),

        // ✅ REQUIRED by API
        countryCode: data.mobileNumberSortCode?.toUpperCase(),

        // ✅ tagging
        tagged:
          data.taggedAs === "Home"
            ? 1
            : data.taggedAs === "Office"
              ? 2
              : 3,

        taggedAs:
          data.taggedAs === "Other"
            ? data.taggedAsLabel?.trim() || "Other"
            : data.taggedAs,

        // ✅ geo
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,

        default: data.default ?? false,
      };

      if (editing?._id) {
        await UserAddressService.updateAddress({
          ...payload,
          addressId: editing._id,
        });

        toast.success("Address updated");
      } else {
        await AuthService.createAddress(payload);

        toast.success(t("addressCreated"));
      }

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Save failed"));
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Address" : "Add Address"}
          </DialogTitle>
        </DialogHeader>

        <AddressForm
          onSubmit={handleSubmit}
          defaultValues={editing}
        />
      </DialogContent>
    </Dialog>
  );
}
