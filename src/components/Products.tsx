import React from "react";
import useDummyProducts, { ProductsResponse } from "../hooks/useDummyProducts";
import { Spinner, Alert, Table, useTheme2 } from "@grafana/ui";
import {
	MutableDataFrame,
	FieldType,
	ThresholdsMode,
	DataFrame,
	applyFieldOverrides,
	GrafanaTheme2,
} from "@grafana/data";
import { css } from '@emotion/css';

export function Products() {
	const { error, loading, payload } = useDummyProducts();
	const theme = modifyTheme(useTheme2());
	const tableData = React.useMemo(() => {
		if (payload === null) {
			return new MutableDataFrame();
		}
		return transformPayloadForGrafanaTable(payload, theme);
	}, [payload]);
	const containerStyles = css`
		width: 1200px;
		height: 600px;
		margin: 10px auto;
		overflow: hidden;
		border-radius: 10px;
		border: 1px solid #aaa;
		div { box-sizing: border-box; }
	`;
	return (
		<div className={containerStyles}>
			{error.hasError ? (
				<Alert title="Error with Information Source">{error.userMessage}</Alert>
			) : (
				""
			)}
			{loading ? <Spinner /> : ""}
			{payload !== null ? (
				<Table data={tableData} width={1200} height={600} />
			) : (
				""
			)}
		</div>
	);
}

function modifyTheme(theme: GrafanaTheme2): GrafanaTheme2 {
	theme.colors.background.secondary = "#5465ff"
	theme.colors.background.canvas = "#CCCCCC"
	theme.colors.background.primary = "#CCC";
	return {...theme};
}

export function transformPayloadForGrafanaTable(
	payload: ProductsResponse,
	theme: GrafanaTheme2
): DataFrame {
	const frame = generateProductMutableFrame();

	// Map named rows to positional rows
	(payload?.products || []).map(
		({
			title,
			description,
			price,
			discountPercentage,
			stock,
			brand,
			category,
			rating,
		}) =>
			frame.appendRow([
				title,
				description,
				price,
				discountPercentage,
				stock,
				brand,
				category,
				rating,
			])
	);
	return applyFieldOverrides({
		theme,
		data: [frame],
		fieldConfig: {
			overrides: [],
			defaults:{}
		},
		replaceVariables: (value: string) => value
	})[0];
}

function generateProductMutableFrame() {
	return new MutableDataFrame({
		fields: [
			{
				name: "Title",
				type: FieldType.string,
				values: [],
			},
			{
				name: "Description",
				type: FieldType.string,
				values: [],
			},
			{
				name: "Price",
				type: FieldType.number,
				config: {
					decimals: 2,
					unit: "$",
					custom: {
						width: 100,
					}
				},
				values: [],
			},
			{
				name: "Discount Percentage",
				type: FieldType.number,
				config: {
					decimals: 2,
					unit: "percent",
				},
				values: [],
			},
			{
				name: "Stock",
				type: FieldType.number,
				values: [],
				config: {
					custom: {
						width: 100
					}
				},
			},
			{
				name: "Brand",
				type: FieldType.string,
				values: [],
			},
			{
				name: "Category",
				type: FieldType.string,
				values: [],
			},
			{
				name: "Rating",
				type: FieldType.number,
				config: {
					min: 0,
					max: 5,
					decimals: 1,
					custom: {
						width: 200,
						displayMode: "gradient-gauge",
					},
					thresholds: {
						steps: [
							{
								color: "#CCC",
								value: -Infinity,
							},
							{
								color: "#333",
								value: 0.02,
							},
						],
						mode: ThresholdsMode.Absolute,
					},
				},
				values: [],
			},
		],
	});
}

/*
{
	"id": 1,
	"title": "iPhone 9",
	"description": "An apple mobile which is nothing like apple",
	"price": 549,
	"discountPercentage": 12.96,
	"rating": 4.69,
	"stock": 94,
	"brand": "Apple",
	"category": "smartphones",
	"thumbnail": "https://i.dummyjson.com/data/products/1/thumbnail.jpg",
	"images": [
		"https://i.dummyjson.com/data/products/1/1.jpg",
		"https://i.dummyjson.com/data/products/1/2.jpg",
		"https://i.dummyjson.com/data/products/1/3.jpg",
		"https://i.dummyjson.com/data/products/1/4.jpg",
		"https://i.dummyjson.com/data/products/1/thumbnail.jpg"
	]
}
*/
