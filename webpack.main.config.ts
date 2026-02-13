import type { Configuration } from "webpack";
import webpack from "webpack";
import path from "path"

import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

// TypeORM tries to dynamic-require these drivers. Since we only use 'better-sqlite3',
// we ignore them to silence "Module not found" warnings during the Webpack build.
const optionalTypeOrmDrivers = [
  // Relational Databases
  'mysql', 'mysql2', 'pg', 'pg-native', 'pg-query-stream', 'mssql', 'oracledb', 'sqlite3',
  // NoSQL & Cloud
  'mongodb', 'redis', 'ioredis', '@google-cloud/spanner',
  // Specialized & Others
  'sql.js', 'typeorm-aurora-data-api-driver', 'react-native-sqlite-storage',
  '@sap/hana-client', 'hdb-pool',
];

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/main.ts",
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new webpack.IgnorePlugin({
      resourceRegExp: new RegExp(`^(${optionalTypeOrmDrivers.join('|').replace(/\./g, '\\.')})$`),
      // Only ignore these when they are requested by TypeORM
      contextRegExp: /node_modules[\\/]typeorm/,
    }),
  ],
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
