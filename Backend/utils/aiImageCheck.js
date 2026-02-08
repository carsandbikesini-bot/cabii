module.exports.checkAIImage = async (filePath) => {
  // Phase 1: simple heuristic
  // Phase 2: AI model / API

  // For now (safe):
  return {
    isAI: false,
    confidence: 0.12
  };
};