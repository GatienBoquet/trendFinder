import dotenv from "dotenv";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

dotenv.config();

export async function generateDraft(rawStories: string) {
  console.log(
    `Generating a post draft with raw stories (${rawStories.length} characters)...`
  );

  try {
    const openai = new OpenAI({
      baseURL: "http://localhost:1234/v1",
      apiKey: "lm-studio",
    });

    // Define the schema for our response
    const DraftPostSchema = z.object({
      trendingIdeas: z.array(
        z.object({
          tweet_link: z.string(),
          description: z.string(),
        })
      ),
    });

    // Create a date string if you need it elsewhere
    const currentDate = new Date().toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      month: "numeric",
      day: "numeric",
    });

    const completion = await openai.beta.chat.completions.parse({
      model: "meta-llama-3.1-8b-instruct",
      messages: [
        {
          role: "user",
          content: `Given a list of raw AI and LLM-related tweets sourced from x/twitter, identify trends, launches, or interesting ideas. We want to create X content based on these trending things. For each tweet, provide the tweet link and a 1-sentence description focusing on why it's important for AI developers and how we might be able to use it in our content (We are a web scraping company for AI developers). Return each trend as a separate object with tweet_link and description. List ALL of the tweets that are relevant. Try to pick at least 10 tweets. If there are less than 10 tweets, pick all of them.

Here are the raw tweets you may pick from:\n\n ${rawStories}\n\n`,
        },
      ],
      response_format: zodResponseFormat(DraftPostSchema, "trendingIdeas"),
    });

    const parsedResponse = completion.choices[0].message.parsed;
    const header = `🚀 AI and LLM Trends on X for ${currentDate}\n\n`;
    const draft_post =
      header +
      parsedResponse!.trendingIdeas
        .map((idea) => `• ${idea.description} \n  ${idea.tweet_link}`)
        .join("\n\n");

    return draft_post;
  } catch (error) {
    console.log("error generating draft post");
    console.log(error);
  }
}
