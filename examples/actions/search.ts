export const searchInternetCallable = {
  name: "search_internet",
  description:
    "a search engine. useful for when you need to answer questions about current events. input should be a search query.",
  input:
    "A string, a simple explanation of what you need. This is like a google search.",
  handler: searchGoogleApi,
};

async function searchGoogleApi(_input: any) {
  // use api to search google
  const result = await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${_input.input}`
  );
  const res = await result.json();
  if (res.answer_box?.answer) {
    return {
      result: res.answer_box.answer,
      attributes: {},
    };
  }
  if (res.answer_box?.snippet) {
    return {
      result: res.answer_box.snippet,
      attributes: {},
    };
  }
  return "No result found";
}
