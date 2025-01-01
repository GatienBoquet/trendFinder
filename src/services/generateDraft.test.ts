import { generateDraft } from "./generateDraft";
import { OpenAI } from "openai";
import { ChatCompletion } from "openai/resources/chat";

// Mock the entire OpenAI module
jest.mock("openai");

describe("generateDraft", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Mock the OpenAI constructor to return an object with a mocked beta.chat.completions.parse:
    const mockOpenAI = {
      beta: {
        chat: {
          completions: {
            parse: jest.fn().mockResolvedValue({
              choices: [
                {
                  index: 0,
                  message: {
                    role: "assistant",
                    parsed: {
                      trendingIdeas: [
                        {
                          tweet_link: "https://x.com/test/1",
                          description: "Test description 1",
                        },
                      ],
                    },
                  },
                  finish_reason: "stop",
                },
              ],
            }),
          },
        },
      },
    } as unknown as jest.MockedObjectDeep<OpenAI>;

    // 2. Use the mock implementation when OpenAI is constructed:
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAI
    );
  });

  it("should generate draft post with trending ideas", async () => {
    const result = await generateDraft("raw story content");

    // Get the mock implementation to check if it was called
    const mockParse = (OpenAI as jest.MockedClass<typeof OpenAI>).mock
      .results[0].value.beta.chat.completions.parse;

    expect(mockParse).toHaveBeenCalled();

    expect(result).toContain("🚀 AI and LLM Trends on X for");
    expect(result).toContain("Test description 1");
    expect(result).toContain("https://x.com/test/1");
  });
});
