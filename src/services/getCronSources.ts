import dotenv from "dotenv";

dotenv.config();

export async function getCronSources() {
  try {
    console.log("Fetching sources...");

    // Hardcoded list of sources
    const sources = [{ identifier: "https://x.com/OpenAIDevs" }];

    return sources.map((source) => source.identifier);
  } catch (error) {
    console.error(error);
  }
}
