import { useState, useEffect } from "react";

export interface ProductsResponse {
	products?: ProductEntry[] | null;
	total: number;
	skip: number;
	limit: number;
}

export interface ProductEntry {
	id: number;
	title: string;
	description: string;
	price: number;
	discountPercentage: number;
	rating: number;
	stock: number;
	brand: string;
	category: string;
	thumbnail: string;
	images?: string[] | null;
}

export interface DummyProductError {
	userMessage: string;
	hasError: boolean;
	code: number;
}

const blankError: DummyProductError = {
	hasError: false,
	code: 0,
	userMessage: "",
};

export function isProductResponse(
	candidate: unknown
): candidate is ProductsResponse {
	return typeof candidate === "object";
}

export function isProductEntry(candidate: unknown): candidate is ProductEntry {
	return typeof candidate === "object";
}

export default function useDummyProducts(
	apiUrl: RequestInfo = "https://dummyjson.com/products",
	storageKey: string = "a"
) {
	const [loading, setLoading] = useState<boolean>(false);
	const [payload, setPayload] = useState<ProductsResponse | null>(null);
	const [error, setError] = useState<DummyProductError>(blankError);
	
	useEffect(() => {
		const storedResponse = localStorage.getItem(`dummy-product-${storageKey}`);
		setPayload(storedResponse === null ? storedResponse : JSON.parse(storedResponse));
		(async () => {
			setLoading(true);
			try {
				const result = await fetch(apiUrl);
				if (result.status !== 200) {
					setLoading(false);
					setError({
						hasError: true,
						code: result.status,
						userMessage: "There was a problem accessing the information, please try again later."
					})
					return;
				}
				const body = await result.json();
				if (isProductResponse(body)) {
					setPayload(body);
					localStorage.setItem(`dummy-product-${storageKey}`, JSON.stringify(body));
				}
				else {
					setError({
						hasError: true,
						code: 2,
						userMessage: "The response did not conform to the existing schema"
					});
				}
				setLoading(false);
			} catch (fetchError) {
				setLoading(false);
				setError({
					hasError: true,
					code: 1,
					userMessage: "There was a problem fetching the api.",
				});
				console.error(fetchError);
			}
		})();
		return () => {};
	}, [apiUrl]);

	return {
		loading,
		payload,
		error,
	};
}
