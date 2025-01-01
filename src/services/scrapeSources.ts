import FirecrawlApp from "@mendable/firecrawl-js";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
dotenv.config();

const app = new FirecrawlApp({ apiKey: "", apiUrl: "http://localhost:3002" });

export async function scrapeSources(sources: string[]) {
  const num_sources = sources.length;
  console.log(`Scraping ${num_sources} sources...`);

  let combinedText: { stories: any[] } = { stories: [] };
  const useTwitter = false;
  const useScrape = true;

  for (const source of sources) {
    if (source.includes("x.com")) {
      if (useScrape) {
        try {
          console.log("source", source);
          const crawlResponse = await app.crawlUrl(source, {
            limit: 10,
            scrapeOptions: {
              formats: ["markdown", "html"],
            },
          });

          if (crawlResponse.success && crawlResponse.data) {
            console.log(`Data found using Firecrawl for ${source}`);

            const stories = crawlResponse.data.reduce<any[]>(
              (acc: any[], item: any) => {
                if (item.html) {
                  // Correctly assign the CheerioAPI type
                  const $ = cheerio.load(item.html);

                  $("div[data-testid='tweet']").each(
                    (index: number, element: cheerio.Element) => {
                      // 1. Tweet Text:
                      const tweetText = $(element)
                        .find("div[data-testid='tweetText']")
                        .text();

                      // 2. Tweet Link:
                      let tweetLink = "";
                      const userHandle = $(element)
                        .find("a[href^='/']")
                        .attr("href")
                        ?.substring(1);
                      const statusId = $(element)
                        .find("a[href*='/status/']")
                        .attr("href")
                        ?.split("/status/")[1]
                        ?.split("?")[0];
                      if (userHandle && statusId) {
                        tweetLink = `https://x.com/${userHandle}/status/${statusId}`;
                      }

                      // 3. (Optional) User Name:
                      const userName = $(element)
                        .find("span:contains('@')")
                        .text();

                      // 4. (Optional) Timestamp:
                      const timestamp = $(element)
                        .find("time")
                        .attr("datetime");

                      if (tweetText) {
                        acc.push({
                          headline: tweetText,
                          link: tweetLink || source,
                          date_posted: timestamp || new Date().toISOString(),
                          user: userName,
                        });
                      }
                    }
                  );
                }
                return acc;
              },
              []
            );

            combinedText.stories.push(...stories);
          } else {
            console.warn(
              `No data returned by Firecrawl for ${source}:`,
              crawlResponse
            );
          }
        } catch (error) {
          console.error(`Error scraping ${source} with Firecrawl:`, error);
        }
      }

      if (useTwitter) {
        const usernameMatch = source.match(/x\.com\/([^\/]+)/);

        if (usernameMatch) {
          const username = usernameMatch[1];

          // Construct and encode the queries for both from: and to:
          const fromQuery = `from:${username} has:media -is:reply -is:retweet`;

          const encodedFromQuery = encodeURIComponent(fromQuery);

          // Encode the start time
          const startTime = new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ).toISOString();
          const encodedStartTime = encodeURIComponent(startTime);

          // Make requests for both from: and to: tweets
          const fromApiUrl = `https://api.x.com/2/tweets/search/recent?query=${encodedFromQuery}&max_results=10&start_time=${encodedStartTime}`;

          // Fetch tweets from both endpoints
          const fromResponse = await fetch(fromApiUrl, {
            headers: {
              Authorization: `Bearer ${process.env.X_API_BEARER_TOKEN}`,
            },
          });

          if (!fromResponse.ok) {
            throw new Error(
              `Failed to fetch from: tweets for ${username}: ${fromResponse.statusText}`
            );
          }

          const fromTweets = await fromResponse.json();

          // Process from: tweets
          if (fromTweets.data && Array.isArray(fromTweets.data)) {
            console.log(`Tweets found from username ${username}`);
            const stories = fromTweets.data.map((tweet: any) => {
              return {
                headline: tweet.text,
                link: `https://x.com/i/status/${tweet.id}`,
                date_posted: startTime,
              };
            });
            combinedText.stories.push(...stories);
          }
        }
      }
    }
  }
  //fs.writeFileSync('./combinedText.json', JSON.stringify(combinedText, null, 2));
  const rawStories = combinedText.stories;
  return rawStories;
}
