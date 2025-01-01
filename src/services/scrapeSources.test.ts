import { scrapeSources } from "./scrapeSources";
import FirecrawlApp from "@mendable/firecrawl-js";

jest.mock("@mendable/firecrawl-js");
global.fetch = jest.fn();

describe("scrapeSources", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIRECRAWL_API_KEY = "test-key";
    process.env.X_API_BEARER_TOKEN = "test-token";
  });

  it("should scrape tweets from X/Twitter sources", async () => {
    const mockTweetsResponse = {
      data: [
        {
          id: "123",
          text: "Test tweet",
        },
      ],
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTweetsResponse),
      })
    );

    const sources = ["https://x.com/testuser"];
    const result = await scrapeSources(sources);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      headline: "Test tweet",
      link: expect.stringContaining("123"),
      date_posted: expect.any(String),
    });
  });
});
