export function camelCase(input: string): string {
  if (!input) return input;

  // Replace non-alphabetic and non-numeric characters (except for underscores) with space, and trim the input.
  input = input.replace(/[^a-zA-Z0-9_]+/g, ' ').trim();
  

  // Split the string by whitespace and underscores, and convert the first word to lowercase.
  const words = input.split(/\s+|_/);

  // Map through each word and convert them to the appropriate case.
  return words
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join('');
  }
