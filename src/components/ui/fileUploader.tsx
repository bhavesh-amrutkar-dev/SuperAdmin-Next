import { useState, useRef, useEffect } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface FileUploaderProps {
    title?: string;
    onFileChange: (files: (File | string)[]) => void;
    acceptedTypes?: string;
    helperText?: string;
    maxSizeInMB?: number;
    currentFiles?: (File | string)[];
    maxFiles?: number;
    disabled?: boolean;
}

export function FileUploader({
    title = "Files",
    onFileChange,
    acceptedTypes = ".jpg,.png,.jpeg,.pdf,.doc,.docx",
    helperText = "Max 10MB per file",
    maxSizeInMB = 10,
    currentFiles = [],
    maxFiles = 10,
    disabled = false
}: FileUploaderProps) {
    const [files, setFiles] = useState<(File | string)[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync prop -> local state on mount/update
    useEffect(() => {
        setFiles(currentFiles);
    }, [currentFiles]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (fileList: FileList) => {
        if (disabled) return;
        const newFiles: File[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];

            if (files.length + newFiles.length >= maxFiles) {
                toast.error(`You can only upload a maximum of ${maxFiles} files.`);
                break;
            }

            if (file.size > maxSizeInMB * 1024 * 1024) {
                toast.error(`${file.name} exceeds the ${maxSizeInMB}MB limit.`);
                continue;
            }

            const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
            if (
                !acceptedTypes.includes(fileExtension) &&
                !acceptedTypes.includes(file.type)
            ) {
                toast.error(`${file.name} is not supported.`);
                continue;
            }

            newFiles.push(file);
        }

        if (newFiles.length) {
            const updated = [...files, ...newFiles];
            setFiles(updated);
            onFileChange(updated);
        }
    };

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        onFileChange(updated);
    };

    return (
        <div className="space-y-4 border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center">
                <div className="font-medium text-sm">{title}</div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Select File
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept={acceptedTypes}
                    onChange={handleChange}
                    disabled={disabled}
                />
            </div>

            <div
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center 
    ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
    ${dragActive ? "border-primary bg-primary/5" : "border-gray-200"}`}

                onDragEnter={!disabled ? handleDrag : undefined}
                onDragOver={!disabled ? handleDrag : undefined}
                onDragLeave={!disabled ? handleDrag : undefined}
                onDrop={!disabled ? handleDrop : undefined}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium mb-1">
                    Drop files here or click to upload
                </p>
                <p className="text-xs text-gray-500">{helperText}</p>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Files</h4>
                    <ul className="space-y-1">
                        {files.map((fileItem, index) => {
                            const isFileObject =
                                typeof window !== "undefined" && fileItem instanceof File;
                            const displayName = isFileObject
                                ? fileItem.name
                                : String(fileItem).split("/").pop() || String(fileItem);

                            return (
                                <li
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                                >
                                    <div className="flex items-center">
                                        <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                                        <span className="truncate max-w-xs">{displayName}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => removeFile(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
