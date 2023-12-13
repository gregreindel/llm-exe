export const hookOnComplete = `onComplete`;
export const hookOnError = `onError`;
export const hookOnSuccess = `onSuccess`;


export const OpenAiPricing =  {
    "gpt-3.5-turbo": [1000, 0.0010, 0.0020],
    "gpt-3.5-turbo-1106": [1000, 0.0010, 0.0020],
    "gpt-3.5-turbo-instruct": [1000, 0.0015, 0.0020],
    "gpt-4": [1000, 0.03, 0.06],
    "gpt-4-32k": [1000, 0.06, 0.12],

    "gpt-4-turbo": [1000, 0.01, 0.03],
    "gpt-4-1106-preview": [1000, 0.01, 0.03],
    "gpt-4-1106-vision-preview": [1000, 0.01, 0.03],
    davinci: [1000, 0.02, 0.02],
    "text-curie-001": [1000, 0.002, 0.002],
    "text-babbage-001": [1000, 0.0005, 0.0005],
    "text-ada-001": [1000, 0.0001, 0.0001],
    "text-embedding-ada-002": [1000, 0.0001, 0.0001],
};