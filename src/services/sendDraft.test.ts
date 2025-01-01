import { sendDraft } from "./sendDraft";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("sendDraft", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully send draft to Slack", async () => {
    const mockDraft = "Test draft content";
    mockedAxios.post.mockResolvedValueOnce({ data: "ok" });

    const result = await sendDraft(mockDraft);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      { text: mockDraft },
      { headers: { "Content-Type": "application/json" } }
    );
    expect(result).toMatch(/Success sending draft to Slack at/);
  });

  it("should handle errors gracefully", async () => {
    const mockDraft = "Test draft content";
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    const consoleSpy = jest.spyOn(console, "log");
    await sendDraft(mockDraft);

    expect(consoleSpy).toHaveBeenCalledWith("error sending draft to Slack");
  });
});
