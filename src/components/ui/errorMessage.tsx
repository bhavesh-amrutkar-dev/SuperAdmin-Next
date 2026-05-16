import { AlertCircle } from "lucide-react";
import React from "react";

interface ErrorMessageProps {
    message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;

    return (
        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle size={14} className="text-red-500" />
            {message}
        </p>
    );
};

export default ErrorMessage;
