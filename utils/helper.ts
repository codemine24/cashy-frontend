export const makeImageUrl = (path?: string | null, bucket?: string): string => {
  if (!path) return "";
  return `${process.env.EXPO_PUBLIC_SUPABASE_BUCKET_URL}/${bucket}/${path}`;
};