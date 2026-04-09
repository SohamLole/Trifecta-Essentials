const difficultyScoreMap = { easy: 1, medium: 2, hard: 3 };

const categoryPriority = ["bug", "auth", "api", "ui", "notes", "general"];

const categoryProfiles = {
  bug: {
    summary: "Potential application bugs were detected from the screenshot text.",
    fixes: [
      "Check the stack trace or nearby logs to isolate the failing line or component.",
      "Add guards around undefined or null access before re-running the failing path.",
      "Reproduce the issue locally and add a regression test once the root cause is confirmed."
    ]
  },
  auth: {
    summary: "Authentication or authorization issues were detected.",
    fixes: [
      "Verify login, token refresh, and session expiry flows for the affected user action.",
      "Check OAuth client configuration, redirect URIs, and secret/environment setup.",
      "Confirm backend permission checks and frontend handling for expired credentials."
    ]
  },
  api: {
    summary: "API or network issues were detected.",
    fixes: [
      "Inspect the failing request, status code, and payload in the network panel or server logs.",
      "Validate request schema, auth headers, and response parsing on both client and server.",
      "Add clearer retry or fallback handling if the failure depends on unstable upstream services."
    ]
  },
  ui: {
    summary: "UI or layout issues were detected.",
    fixes: [
      "Inspect component rendering logic, spacing, and responsive breakpoints for the affected view.",
      "Check CSS class application and overflow constraints around the affected element.",
      "Capture a visual regression test after the fix to prevent recurrence."
    ]
  },
  notes: {
    summary: "The screenshot reads more like notes or planning content than a product defect.",
    fixes: [
      "Turn the noted item into a concrete task with an owner and next step.",
      "Convert reminders or TODOs into tracked backlog entries.",
      "Add specific tags so the screenshot stays easy to find later."
    ]
  },
  general: {
    summary: "The screenshot contains issues or references, but the OCR text is not specific enough for a stronger classification.",
    fixes: [
      "Review the screenshot manually and add clearer custom tags if needed.",
      "Upload a sharper screenshot if OCR missed important context like file names or line numbers.",
      "Document the likely module, endpoint, or screen involved so the issue becomes actionable."
    ]
  }
};

const issueDefinitions = [
  {
    key: "runtime-property-access",
    category: "bug",
    detailedTag: "runtime bug",
    title: "Runtime property access error",
    difficulty: "hard",
    patterns: ["typeerror", "cannot read properties", "undefined", "null"],
    fixes: [
      "Trace the variable that becomes undefined or null before the failing property access.",
      "Add defensive checks or default values before reading nested properties."
    ]
  },
  {
    key: "runtime-reference",
    category: "bug",
    detailedTag: "reference bug",
    title: "Reference or symbol resolution error",
    difficulty: "hard",
    patterns: ["referenceerror", "is not defined", "undefined variable"],
    fixes: [
      "Check whether the symbol is imported, declared, and available in the current scope.",
      "Inspect recent refactors for renamed variables or removed exports."
    ]
  },
  {
    key: "syntax",
    category: "bug",
    detailedTag: "syntax bug",
    title: "Syntax or parsing error",
    difficulty: "hard",
    patterns: ["syntaxerror", "unexpected token", "unexpected identifier", "parse error"],
    fixes: [
      "Inspect the referenced file for missing delimiters, malformed JSX, or invalid syntax.",
      "Run linting or compilation locally to identify the exact parser failure."
    ]
  },
  {
    key: "authentication",
    category: "auth",
    detailedTag: "authentication bug",
    title: "Authentication failure",
    difficulty: "medium",
    patterns: ["unauthorized", "invalid token", "token expired", "session expired", "login failed", "access denied"],
    fixes: [
      "Verify token issuance, expiry handling, and session refresh logic.",
      "Check whether the request includes the expected auth header or session cookie."
    ]
  },
  {
    key: "authorization",
    category: "auth",
    detailedTag: "authorization bug",
    title: "Authorization or permission error",
    difficulty: "medium",
    patterns: ["forbidden", "permission denied", "not allowed", "insufficient permissions"],
    fixes: [
      "Review role-based access checks on the failing endpoint or screen.",
      "Confirm the authenticated user has the required permissions for this action."
    ]
  },
  {
    key: "oauth",
    category: "auth",
    detailedTag: "oauth bug",
    title: "OAuth configuration or callback issue",
    difficulty: "hard",
    patterns: ["oauth", "redirect_uri_mismatch", "invalid_client", "popup_closed", "consent"],
    fixes: [
      "Confirm Google OAuth redirect URIs and client IDs match the running environment.",
      "Inspect callback handling and frontend token exchange after provider sign-in."
    ]
  },
  {
    key: "api-server",
    category: "api",
    detailedTag: "server response bug",
    title: "Server-side API error",
    difficulty: "hard",
    patterns: ["500", "internal server error", "gateway timeout", "bad gateway", "service unavailable"],
    fixes: [
      "Check server logs around the failing request for the exact thrown exception.",
      "Validate backend dependencies, timeouts, and error handling for this endpoint."
    ]
  },
  {
    key: "api-network",
    category: "api",
    detailedTag: "network bug",
    title: "Network or request transport error",
    difficulty: "medium",
    patterns: ["failed to fetch", "network error", "cors", "timeout", "request failed"],
    fixes: [
      "Inspect the request URL, headers, and browser network panel for transport failures.",
      "Verify CORS policy, service availability, and client-side retry behavior."
    ]
  },
  {
    key: "api-validation",
    category: "api",
    detailedTag: "validation bug",
    title: "API validation or payload issue",
    difficulty: "medium",
    patterns: ["validationerror", "invalid payload", "bad request", "required field", "must be", "unprocessable entity"],
    fixes: [
      "Compare the submitted payload against the backend schema and validation rules.",
      "Log the request body to verify required fields and types before submission."
    ]
  },
  {
    key: "ui-layout",
    category: "ui",
    detailedTag: "ui layout bug",
    title: "Layout or spacing issue",
    difficulty: "medium",
    patterns: ["layout", "alignment", "overflow", "responsive", "spacing", "cropped"],
    fixes: [
      "Inspect the container constraints and breakpoint behavior for the affected screen.",
      "Check width, overflow, and flex/grid settings around the broken layout."
    ]
  },
  {
    key: "ui-component",
    category: "ui",
    detailedTag: "ui component bug",
    title: "Component rendering or interaction issue",
    difficulty: "medium",
    patterns: ["button", "modal", "dropdown", "component", "css", "design"],
    fixes: [
      "Verify component state transitions and conditional rendering logic.",
      "Inspect the affected control in the browser to confirm styles and event bindings."
    ]
  },
  {
    key: "notes",
    category: "notes",
    detailedTag: "notes item",
    title: "Action item or note captured in screenshot",
    difficulty: "easy",
    patterns: ["todo", "note", "summary", "meeting", "idea", "reminder"],
    fixes: [
      "Convert the note into a concrete tracked task.",
      "Add a more specific custom tag if this note belongs to a feature or bug cluster."
    ]
  }
];

const uniqueStrings = (items = []) =>
  Array.from(
    new Set(
      (items || [])
        .map((item) => String(item).trim())
        .filter(Boolean)
    )
  );

const getPrimaryCategory = (tags = []) =>
  categoryPriority.find((category) => tags.includes(category)) || "general";

const getTextLines = (text = "") =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const fileLocationRegex =
  /([A-Za-z]:\\[^\s():]+|(?:\/|\.{1,2}\/)?[\w./-]+\.(?:js|jsx|ts|tsx|py|java|go|rb|php|cs|cpp|c|html|css|json)):(\d+)(?::(\d+))?/gi;
const endpointRegex = /\b\/api\/[A-Za-z0-9/_-]+\b/g;
const componentRegex = /\b[A-Z][A-Za-z0-9]+(?:Page|View|Modal|Screen|Component|Form|Card)\b/g;
const lineReferenceRegex = /\bline\s+(\d+)(?:\s*(?:,|:)\s*(?:column\s+)?(\d+))?/i;

const collectLocationCandidates = (line) => {
  const candidates = [];
  let match;

  fileLocationRegex.lastIndex = 0;
  while ((match = fileLocationRegex.exec(line)) !== null) {
    candidates.push(`${match[1]}:${match[2]}${match[3] ? `:${match[3]}` : ""}`);
  }

  endpointRegex.lastIndex = 0;
  while ((match = endpointRegex.exec(line)) !== null) {
    candidates.push(match[0]);
  }

  componentRegex.lastIndex = 0;
  while ((match = componentRegex.exec(line)) !== null) {
    candidates.push(match[0]);
  }

  const lineReference = line.match(lineReferenceRegex);
  if (lineReference) {
    candidates.push(
      `line ${lineReference[1]}${lineReference[2] ? `:${lineReference[2]}` : ""}`
    );
  }

  return uniqueStrings(candidates);
};

const inferLocation = (lines, matchedPatterns, category) => {
  for (let index = 0; index < lines.length; index += 1) {
    const normalizedLine = lines[index].toLowerCase();

    if (!matchedPatterns.some((pattern) => normalizedLine.includes(pattern))) {
      continue;
    }

    const nearbyLines = lines.slice(Math.max(0, index - 1), index + 2);
    const lineCandidates = uniqueStrings(nearbyLines.flatMap(collectLocationCandidates));

    if (lineCandidates.length) {
      return lineCandidates[0];
    }
  }

  const allCandidates = uniqueStrings(lines.flatMap(collectLocationCandidates));

  if (category === "api") {
    const endpoint = allCandidates.find((candidate) => candidate.startsWith("/api/"));
    if (endpoint) {
      return endpoint;
    }
  }

  if (allCandidates.length) {
    return allCandidates[0];
  }

  return "Location not identifiable from screenshot text.";
};

const getEvidenceSnippet = (lines, matchedPatterns) => {
  const evidenceLine = lines.find((line) =>
    matchedPatterns.some((pattern) => line.toLowerCase().includes(pattern))
  );

  return evidenceLine || "";
};

const getFallbackDetailedTag = (category) => {
  const fallbackMap = {
    bug: "runtime bug",
    auth: "authentication bug",
    api: "api bug",
    ui: "ui issue",
    notes: "notes item",
    general: "general issue"
  };

  return fallbackMap[category] || "general issue";
};

const inferDifficultyFromIssues = (issues, tags, text) => {
  if (issues.some((issue) => issue.difficulty === "hard")) {
    return "hard";
  }

  if (
    issues.some((issue) => issue.difficulty === "medium") ||
    tags.includes("ui") ||
    tags.includes("auth") ||
    tags.includes("api") ||
    /error|failed|invalid|token|exception|traceback/i.test(text)
  ) {
    return "medium";
  }

  return "easy";
};

const buildSummary = (category, difficulty, issues, text) => {
  const baseSummary = categoryProfiles[category]?.summary || categoryProfiles.general.summary;

  if (!text) {
    return "OCR could not extract enough text to generate a specific issue breakdown.";
  }

  if (!issues.length) {
    return `${baseSummary} Difficulty is currently estimated as ${difficulty}.`;
  }

  const issueLabels = issues
    .slice(0, 3)
    .map((issue) => issue.detailedTag)
    .join(", ");

  return `${baseSummary} Detected issue tags: ${issueLabels}. Estimated difficulty: ${difficulty}.`;
};

const getSuggestedFixes = (category, difficulty, issues) => {
  const categoryFixes = categoryProfiles[category]?.fixes || categoryProfiles.general.fixes;
  const issueFixes = issues.flatMap((issue) => issue.suggestedFixes || []);
  const fixes = uniqueStrings([...issueFixes, ...categoryFixes]);

  if (difficulty === "hard") {
    fixes.push(
      "Break the investigation into reproduction, exact location confirmation, root-cause analysis, and verification steps."
    );
  }

  return uniqueStrings(fixes).slice(0, 5);
};

const withIssueTagLabels = (issues) => {
  const counts = new Map();

  return issues.map((issue) => {
    const baseTag = issue.detailedTag || "general issue";
    const nextCount = (counts.get(baseTag) || 0) + 1;
    counts.set(baseTag, nextCount);

    return {
      ...issue,
      tagLabel: `${baseTag} ${nextCount}`
    };
  });
};

const buildIssuesFromDefinitions = (text, tags) => {
  const normalizedText = text.toLowerCase();
  const lines = getTextLines(text);

  const issues = issueDefinitions
    .map((definition) => {
      const matchedPatterns = definition.patterns.filter((pattern) =>
        normalizedText.includes(pattern)
      );

      if (!matchedPatterns.length) {
        return null;
      }

      return {
        title: definition.title,
        category: definition.category,
        detailedTag: definition.detailedTag,
        location: inferLocation(lines, matchedPatterns, definition.category),
        evidence: getEvidenceSnippet(lines, matchedPatterns),
        matchedSignals: uniqueStrings(matchedPatterns),
        suggestedFixes: uniqueStrings(definition.fixes),
        difficulty: definition.difficulty
      };
    })
    .filter(Boolean);

  if (issues.length || !text) {
    return withIssueTagLabels(issues);
  }

  const primaryCategory = getPrimaryCategory(tags);

  return withIssueTagLabels([
    {
      title: `${primaryCategory} issue detected`,
      category: primaryCategory,
      detailedTag: getFallbackDetailedTag(primaryCategory),
      location: inferLocation(lines, [], primaryCategory),
      evidence: lines[0] || "",
      matchedSignals: [],
      suggestedFixes: categoryProfiles[primaryCategory]?.fixes || categoryProfiles.general.fixes,
      difficulty: primaryCategory === "notes" ? "easy" : "medium"
    }
  ]);
};

const analyzeIssue = (text = "", tags = []) => {
  const issues = buildIssuesFromDefinitions(text, tags);
  const issueCategory = getPrimaryCategory([
    ...tags,
    ...issues.map((issue) => issue.category)
  ]);
  const difficulty = inferDifficultyFromIssues(issues, tags, text);
  const matchedSignals = uniqueStrings(issues.flatMap((issue) => issue.matchedSignals));
  const detailedTags = uniqueStrings(issues.map((issue) => issue.detailedTag));
  const issueTags = uniqueStrings(issues.map((issue) => issue.tagLabel));
  const primaryLocation =
    issues.find(
      (issue) =>
        issue.location && issue.location !== "Location not identifiable from screenshot text."
    )?.location || "";

  return {
    issueCategory,
    difficulty,
    difficultyScore: difficultyScoreMap[difficulty],
    matchedSignals,
    issueSummary: buildSummary(issueCategory, difficulty, issues, text),
    suggestedFixes: getSuggestedFixes(issueCategory, difficulty, issues),
    detailedTags,
    issueTags,
    primaryLocation,
    issues: issues.map(({ difficulty: _difficulty, ...issue }) => issue)
  };
};

export const buildSortQuery = ({ sortBy, sortOrder }) => {
  const direction = sortOrder === "asc" ? 1 : -1;

  if (sortBy === "difficulty") {
    return {
      difficultyScore: direction,
      createdAt: -1
    };
  }

  return {
    createdAt: direction
  };
};

export default analyzeIssue;
