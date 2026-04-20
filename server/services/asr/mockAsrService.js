function transcribeFromText(transcriptText) {
  return transcriptText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const matched = line.match(/^([^：:]+)[：:](.+)$/);
      const speaker = matched ? matched[1].trim() : `speaker_${(idx % 4) + 1}`;
      const text = matched ? matched[2].trim() : line;
      return {
        speaker,
        startMs: idx * 8000,
        endMs: idx * 8000 + 7000,
        text
      };
    });
}

module.exports = {
  transcribeFromText
};
