import nextConfig from "eslint-config-next/core-web-vitals"

const config = [
	{
		ignores: ["**/.venv/**", "**/.next/**", "**/node_modules/**", "**/out/**"],
	},
	...nextConfig,
]

export default config
