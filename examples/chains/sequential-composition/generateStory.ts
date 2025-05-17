import { createOutline } from "./createOutline";
import { createStoryFromOutline } from "./createStoryFromOutline";

export async function generateStory(idea: string): Promise<string> {
  const outline = await createOutline({ idea });
  console.log("Outline points:", outline);

  const story = await createStoryFromOutline({ outline, idea });
  return story;
}
