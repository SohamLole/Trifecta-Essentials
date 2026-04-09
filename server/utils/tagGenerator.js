const tagRules = [
  {
    tag: "bug",
    keywords: ["error", "undefined", "exception", "traceback", "failed", "crash", "bug"]
  },
  {
    tag: "ui",
    keywords: ["ui", "design", "layout", "button", "screen", "component", "css"]
  },
  {
    tag: "notes",
    keywords: ["note", "summary", "todo", "reminder", "meeting", "idea"]
  },
  {
    tag: "auth",
    keywords: ["login", "signup", "password", "authentication", "otp", "verify"]
  },
  {
    tag: "api",
    keywords: ["api", "request", "response", "endpoint", "payload", "json"]
  }
];

const generateTags = (text = "") => {
  const normalizedText = text.toLowerCase();

  const tags = tagRules
    .filter(({ keywords }) => keywords.some((keyword) => normalizedText.includes(keyword)))
    .map(({ tag }) => tag);

  if (!tags.length && normalizedText) {
    tags.push("general");
  }

  return Array.from(new Set(tags));
};

export default generateTags;
