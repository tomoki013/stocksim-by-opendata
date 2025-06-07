import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  	webpack: (config) => {
  	  	config.module.rules.push({
  	  	  	test: /\.csv$/, // .csvファイルに適用する
  	  	  	use: [
  	  	  	  	{
  	  	  	  	  	loader: 'raw-loader', // raw-loaderを使ってファイルの中身を文字列として読み込む
  	  	  	  	  	options: {
  	  	  	  	  	 	 esModule: false,
  	  	  	  	  	},
  	  	  	  	},
  	  	  	],
  	  	});
	  
  	  	return config;
  	},
  	/* config options here */
};

export default nextConfig;
