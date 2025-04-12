import { supabase } from "./supabaseClient";

export const UploadImage = async (file: File | null): Promise<string> => {
  if (!file) return "";

  try {
    const fileExt = file.type.split("/")[1];
    const path = `${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("account-picture")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("account-picture").getPublicUrl(uploadData.path);

    return publicUrl;
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image :", error);
    throw error;
  }
};
