import nextConfig from "eslint-config-next/core-web-vitals"
import prettier from "eslint-config-prettier"

const config = [
	{
		ignores: ["**/.venv/**", "**/.next/**", "**/node_modules/**", "**/out/**"],
	},
	...nextConfig,
	// Must be last — disables ESLint rules that conflict with Prettier formatting
	prettier,
]

export default config
