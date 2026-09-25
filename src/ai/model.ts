/**
 * The one place the actual model choice lives. Swapping to
 * Qwen2.5-0.5B-Instruct (the roadmap's documented fallback candidate) if
 * on-device testing ever shows this one's structured-output reliability is
 * too poor for a specific use case means changing this file only.
 */
export const MODEL_ID = 'onnx-community/gemma-3-270m-it-ONNX'
export const MODEL_DTYPE = 'q4'
export const DEFAULT_MAX_NEW_TOKENS = 96
