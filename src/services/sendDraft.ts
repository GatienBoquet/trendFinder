import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function sendDraft(draft_post: string) {
  //send draft to console.log
  console.log(draft_post);
  /*   try {
    const response = await axios.post(
      process.env.SLACK_WEBHOOK_URL || '',
      {
        text: draft_post,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return `Success sending draft to Slack at ${new Date().toISOString()}`;
  } catch (error) {
    console.log('error sending draft to Slack');
    console.log(error);
  } */
}
