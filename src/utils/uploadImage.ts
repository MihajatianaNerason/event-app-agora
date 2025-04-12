import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient";

/**
 * Uploads an image to the Supabase storage bucket
 * @param file - The file to upload
 * @param bucket - The bucket name to upload to
 * @returns The URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string = "account-picture"
): Promise<string> => {
  try {
    // Create a unique file name to prevent overwrites
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Check current user to validate authentication
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error("Vous devez être connecté pour télécharger une image");
    }

    // Upload the file to the bucket
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true, // Allow overwriting files with the same name
        cacheControl: "3600", // Cache for 1 hour
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      if (uploadError.message.includes("row-level security policy")) {
        throw new Error(
          "Erreur de permission pour le téléchargement. Veuillez contacter l'administrateur."
        );
      }
      throw new Error(`Erreur de téléchargement: ${uploadError.message}`);
    }

    // Get the public URL for the file
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    throw error;
  }
};
