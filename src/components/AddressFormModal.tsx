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

export default function AddressFormModal({
  open,
  onClose,
  onSuccess,
  editing,
}: any) {
  const t = useTranslations();
  const handleSubmit = async (data: any) => {
    try {
      if (editing?._id) {
        const {
          _id,
          userType,
          createdTimeStamp,
          createdIsoDate,
          countryName,
          cityId,
          cityName,
          shopifyStoreId,
          mbxAddressId,
          zoneId,
          zoneName,
          ...rest
        } = data;

        const payload = {
          ...rest,

          name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          addressId: editing._id,
        };

        await UserAddressService.updateAddress(payload);

        toast.success("Address updated");
      } else {
        await AuthService.createAddress({
          ...data,
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        });

        toast.success(t("addressCreated"));
      }

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
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
