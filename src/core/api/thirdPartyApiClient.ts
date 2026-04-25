import axios, { type AxiosInstance } from 'axios';

type ThirdPartyApiConfig = {
	baseURL: string;
	timeout?: number;
};

const thirdPartyApiRegistry = {
	provincesOpenApi: {
		baseURL: import.meta.env.VITE_THIRD_PARTY_API_PROVINCES_URL || 'https://provinces.open-api.vn/api/v2',
		timeout: 15000,
	},
} as const satisfies Record<string, ThirdPartyApiConfig>;

export type ThirdPartyApiName = keyof typeof thirdPartyApiRegistry;

const thirdPartyClientCache = new Map<ThirdPartyApiName, AxiosInstance>();

const createThirdPartyApiClient = (config: ThirdPartyApiConfig) =>
	axios.create({
		baseURL: config.baseURL,
		timeout: config.timeout ?? 15000,
	});

export const getThirdPartyApiClient = (name: ThirdPartyApiName): AxiosInstance => {
	const cached = thirdPartyClientCache.get(name);
	if (cached) {
		return cached;
	}

	const config = thirdPartyApiRegistry[name];
	const client = createThirdPartyApiClient(config);
	thirdPartyClientCache.set(name, client);
	return client;
};

// Backward-compatible export for current callers.
export const thirdPartyApiClient = getThirdPartyApiClient('provincesOpenApi');
