import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true
    },
    category: {
      type: String,
      default: "general",
      trim: true,
      lowercase: true
    },
    detailedTag: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },
    tagLabel: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },
    location: {
      type: String,
      default: "",
      trim: true
    },
    evidence: {
      type: String,
      default: "",
      trim: true
    },
    matchedSignals: {
      type: [String],
      default: []
    },
    suggestedFixes: {
      type: [String],
      default: []
    }
  },
  {
    _id: false
  }
);

const screenshotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    extractedText: {
      type: String,
      default: "",
      trim: true
    },
    issueCategory: {
      type: String,
      default: "general",
      trim: true,
      lowercase: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    difficultyScore: {
      type: Number,
      default: 2
    },
    issueSummary: {
      type: String,
      default: "",
      trim: true
    },
    suggestedFixes: {
      type: [String],
      default: []
    },
    matchedSignals: {
      type: [String],
      default: []
    },
    detailedTags: {
      type: [String],
      default: []
    },
    issueTags: {
      type: [String],
      default: []
    },
    primaryLocation: {
      type: String,
      default: "",
      trim: true
    },
    issues: {
      type: [issueSchema],
      default: []
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.from(
          new Set(
            (tags || [])
              .map((tag) => String(tag).trim().toLowerCase())
              .filter(Boolean)
          )
        )
    }
  },
  {
    timestamps: true
  }
);

screenshotSchema.index({ owner: 1, createdAt: -1 });
screenshotSchema.index({ owner: 1, difficultyScore: -1, createdAt: -1 });
screenshotSchema.index({
  owner: 1,
  extractedText: "text",
  tags: "text",
  detailedTags: "text",
  issueTags: "text",
  issueSummary: "text",
  issueCategory: "text",
  primaryLocation: "text",
  "issues.title": "text",
  "issues.detailedTag": "text",
  "issues.tagLabel": "text",
  "issues.location": "text",
  "issues.evidence": "text"
});

const Screenshot = mongoose.model("Screenshot", screenshotSchema);

export default Screenshot;
