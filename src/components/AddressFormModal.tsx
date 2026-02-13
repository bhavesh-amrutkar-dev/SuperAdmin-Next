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

export default function AddressFormModal({
  open,
  onClose,
  onSuccess,
  editing,
}: any) {

  const handleSubmit = async (data: AddressFormRM) => {
    try {
      if (editing?._id) {
        await UserAddressService.updateAddress(editing._id, data);
        toast.success("Address updated");
      } else {
        await AuthService.createAddress(data);
        toast.success("Address created");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
