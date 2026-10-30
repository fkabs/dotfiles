/**
 * ustp-openwebui provider (USTP Open WebUI).
 *
 * Same vLLM models as the Bifrost provider, but through Open WebUI, which is reachable
 * worldwide (Bifrost only inside the USTP network). Static list: Open WebUI's /models
 * reports no limits, so keep these in sync with pi/models.json (bifrost) and opencode.json.
 * URL and key come from .zsh_secrets (OPENWEBUI_URL, OPENWEBUI_API_KEY).
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const cost = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

const models = [
	{ id: "vllm/GLM-5.3-Flash-NVFP4", name: "GLM 5.3 Flash", contextWindow: 1048576, maxTokens: 262144 },
	{ id: "vllm/Mistral-Large-4-1T-A52B-NVFP4", name: "Mistral Large 4", contextWindow: 131072, maxTokens: 32768 },
	{ id: "vllm/Qwen3.8-Flash-Next-NVFP4", name: "Qwen3.8 Flash Next", contextWindow: 262144, maxTokens: 65536 },
	{ id: "vllm/Qwen3.8-27B-FP8", name: "Qwen3.8 27B", contextWindow: 262144, maxTokens: 65536 },
	{ id: "vllm/Qwen3-Coder-Next-FP8", name: "Qwen3 Coder Next", contextWindow: 262144, maxTokens: 65536 },
	{ id: "vllm/gemma-4-31B-it", name: "Gemma 4 31B", contextWindow: 131072, maxTokens: 32768 },
].map((model) => ({ ...model, reasoning: false, input: ["text" as const], cost }));

export default function (pi: ExtensionAPI) {
	const baseUrl = process.env.OPENWEBUI_URL;
	if (!baseUrl) return; // unset in this shell (stale session or no .zsh_secrets): skip instead of failing startup
	pi.registerProvider("ustp-openwebui", {
		name: "USTP (Open WebUI)",
		baseUrl,
		apiKey: "$OPENWEBUI_API_KEY",
		api: "openai-completions",
		models,
	});
}
