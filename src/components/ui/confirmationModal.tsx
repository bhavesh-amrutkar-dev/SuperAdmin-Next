"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

interface ConfirmationModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    variant?: "default" | "destructive";
    disableOutsideClose?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onConfirm,
    onCancel,
    title = "Are you sure?",
    message = "Do you really want to proceed with this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    variant = "default",
    disableOutsideClose = false,
}) => {
    const t = useTranslations()
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent
                disableOutsideClose={disableOutsideClose}
                disableEscapeClose={disableOutsideClose}
                className="sm:max-w-md"
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6 gap-3">
                  
                    <Button
                        variant={variant === "destructive" ? "destructive" : "primary"}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? t("pleaseWait") : confirmText}

                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
