import type { ProductDescriptionJson } from "../types/api";

/**
 * Parses a product description string into a structured JSON object
 * @param descriptionString - Raw description string from backend
 * @returns Parsed ProductDescriptionJson object with fallback values
 */
export const parseProductDescription = (
  descriptionString: string,
): ProductDescriptionJson => {
  try {
    // Attempt to parse the string as JSON
    const parsed = JSON.parse(descriptionString);

    // Validate the required fields and provide fallbacks
    const result: ProductDescriptionJson = {
      summary: parsed.summary || "",
      description: parsed.description || "",
      link_video: parsed.link_video || undefined,
      color: Array.isArray(parsed.color) ? parsed.color : undefined,
      attribute:
        parsed.attribute && typeof parsed.attribute === "object"
          ? parsed.attribute
          : undefined,
    };

    return result;
  } catch (error) {
    console.warn(
      "Failed to parse product description as JSON, using fallback:",
      error,
    );

    // If parsing fails, treat the entire string as description
    return {
      summary: "",
      description: descriptionString,
      link_video: undefined,
      color: undefined,
      attribute: undefined,
    };
  }
};

/**
 * Converts a ProductDescriptionJson object back to a string for backend
 * @param descriptionJson - Structured description object
 * @returns JSON string representation
 */
export const stringifyProductDescription = (
  descriptionJson: ProductDescriptionJson,
): string => {
  try {
    // Remove undefined/empty fields before stringifying
    const cleanedJson: Partial<ProductDescriptionJson> = {};

    if (descriptionJson.summary) cleanedJson.summary = descriptionJson.summary;
    if (descriptionJson.description)
      cleanedJson.description = descriptionJson.description;
    if (descriptionJson.link_video)
      cleanedJson.link_video = descriptionJson.link_video;
    if (descriptionJson.color && descriptionJson.color.length > 0)
      cleanedJson.color = descriptionJson.color;
    if (
      descriptionJson.attribute &&
      Object.keys(descriptionJson.attribute).length > 0
    ) {
      cleanedJson.attribute = descriptionJson.attribute;
    }

    return JSON.stringify(cleanedJson);
  } catch (error) {
    console.error("Failed to stringify product description:", error);
    // Fallback to just the description field
    return descriptionJson.description || "";
  }
};

/**
 * Validates if a string is a valid ProductDescriptionJson
 * @param descriptionString - String to validate
 * @returns boolean indicating if the string can be parsed as ProductDescriptionJson
 */
export const isValidProductDescriptionJson = (
  descriptionString: string,
): boolean => {
  try {
    const parsed = JSON.parse(descriptionString);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
};

/**
 * Creates an empty ProductDescriptionJson object with default values
 * @returns Default ProductDescriptionJson object
 */
export const createEmptyProductDescription = (): ProductDescriptionJson => ({
  summary: "",
  description: "",
  link_video: undefined,
  color: undefined,
  attribute: undefined,
});

/**
 * Validates hex color codes
 * @param color - Color string to validate
 * @returns boolean indicating if the color is a valid hex code
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Filters out invalid hex colors from a color array
 * @param colors - Array of color strings
 * @returns Array with only valid hex colors
 */
export const filterValidColors = (colors: string[]): string[] => {
  return colors.filter(isValidHexColor);
};

/**
 * Detects the type of video URL and extracts necessary information
 * @param videoUrl - The video URL to analyze
 * @returns Object with video type and processed URL/ID
 */
export const analyzeVideoUrl = (
  videoUrl: string,
): {
  type: "youtube" | "direct" | "unknown";
  embedUrl?: string;
  videoId?: string;
  originalUrl: string;
} => {
  if (!videoUrl) return { type: "unknown", originalUrl: videoUrl };

  // YouTube URL patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = videoUrl.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        videoId,
        originalUrl: videoUrl,
      };
    }
  }

  // Check if it's a direct video file
  const directVideoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  const isDirectVideo = directVideoExtensions.some((ext) =>
    videoUrl.toLowerCase().includes(ext),
  );

  if (isDirectVideo) {
    return {
      type: "direct",
      originalUrl: videoUrl,
    };
  }

  return { type: "unknown", originalUrl: videoUrl };
};

/**
 * Validates if a video URL is accessible and valid
 * @param videoUrl - URL to validate
 * @returns boolean indicating validity
 */
export const isValidVideoUrl = (videoUrl: string): boolean => {
  try {
    const url = new URL(videoUrl);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};
