"use client";

import { ImageUp } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useCallback } from "react";

interface ImageUploadBoxProps {
  onChange: (value: string) => void;
  value: string;
}

declare global {
  var cloudinary: any;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ onChange, value }) => {
  const handleUpload = useCallback(
    (result: any) => {
      document.documentElement.removeAttribute("data-cloudinary-open");
      if (result?.info?.secure_url) {
        onChange(result.info.secure_url);
      }
    },
    [onChange],
  );

  const handleWidgetOpen = useCallback(() => {
    document.documentElement.setAttribute("data-cloudinary-open", "true");
  }, []);

  const handleWidgetClose = useCallback(() => {
    document.documentElement.removeAttribute("data-cloudinary-open");
  }, []);

  const hasImage = value && value.length > 0;

  return (
    <CldUploadWidget
      options={{
        showAdvancedOptions: false,
        showSkipCropButton: false,
        showUploadMoreButton: false,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
      }}
      uploadPreset="z6euuqyl"
      onClose={() => {
        handleWidgetClose();
      }}
      onError={() => {
        handleWidgetClose();
      }}
      onOpen={() => {
        handleWidgetOpen();
      }}
      onSuccess={(result) => {
        handleUpload(result);
      }}
    >
      {({ open }) => (
        <div
          className="cloudinary-upload-wrapper"
          data-cloudinary-widget="true"
        >
          <button
            className={`relative cursor-pointer hover:opacity-70 transition border-dashed border-2 w-full flex items-center justify-center ${
              hasImage ? "p-5" : "p-10"
            } border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (typeof window !== "undefined" && !window.cloudinary) {
                alert(
                  "Image upload service is loading. Please wait a moment and try again.",
                );

                return;
              }

              handleWidgetOpen();
              open?.();
            }}
          >
            <div className="w-full flex flex-col justify-center items-center">
              <ImageUp size={20} />
              <div className="text-lg">Click to change</div>
            </div>
          </button>
        </div>
      )}
    </CldUploadWidget>
  );
};

export default ImageUploadBox;
