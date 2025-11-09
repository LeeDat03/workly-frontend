"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { CreatePostDTO, MediaItem, PostVisibilityType } from "@/models/profileModel";

type PreviewFile = {
  url: string;
  type: string;
  file: File;
};

type FormData = {
  description: string;
  media: FileList;
};

export default function UploadPostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>();

  // Upload files first and get URLs
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append("media", file);
    });

    try {
      setUploadProgress(0);
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      return response.data.urls || [];
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let mediaUrls: MediaItem []= [];

      // Step 1: Upload files if there are any
      if (previews.length > 0) {
        const files = previews.map((preview) => preview.file);
        mediaUrls = await uploadFiles(files);
      }

      // Step 2: Create post with uploaded URLs
      const postData: CreatePostDTO = {
        content: data.description,
        visibility: PostVisibilityType.PUBLIC, 
        media_url: mediaUrls.length > 0 ? mediaUrls : undefined,
      };

      await axios.post("/api/posts", postData);

      // Clean up
      reset();
      setPreviews([]);
      setUploadProgress(0);
      setIsOpen(false);
      alert("Đăng bài thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng bài.");
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        file: file, // Store the actual file object
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url); // Clean up memory
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  return (
    <div className="text-center">
      {/* Nút mở modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Tạo bài viết
      </button>

      {/* Overlay + Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl p-6 relative animate-fade-in">
            {/* Nút đóng */}
            <button
              onClick={() => {
                setIsOpen(false);
                setPreviews([]);
                setUploadProgress(0);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              disabled={isSubmitting}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Tạo bài viết mới
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <textarea
                {...register("description")}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
                rows={4}
              />

              <input
                type="file"
                multiple
                accept="image/*,video/*"
                {...register("media")}
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 file:text-sm file:font-semibold 
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Preview ảnh & video */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {previews.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith("video/") ? (
                        <video
                          src={file.url}
                          controls
                          className="w-full max-h-64 rounded-md object-cover"
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt={`preview-${index}`}
                          className="w-full max-h-64 object-cover rounded-md"
                        />
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removePreview(index)}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 
                        flex items-center justify-center opacity-0 group-hover:opacity-100 
                        transition-opacity hover:bg-red-600 disabled:opacity-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setPreviews([]);
                    setUploadProgress(0);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 
                  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? uploadProgress > 0 && uploadProgress < 100
                      ? `Đang tải lên... ${uploadProgress}%`
                      : "Đang đăng..."
                    : "Đăng bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}