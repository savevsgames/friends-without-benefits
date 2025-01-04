import { defineConfig } from "cypress";
import viteConfig from "./vite.config"; // Import Vite configuration for Cypress component testing

import { renameSync } from "fs"; // For renaming the report file
import { join } from "path"; // For joining paths in the report file

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    port: 5173, // Match the port specified in the GitHub workflow
    setupNodeEvents(on, config) {
      // Hook to log the component spec completion
      on("after:spec", (spec, results) => {
        console.log(`Component Spec finished: ${spec.relative}`);
        if (results && results.stats.failures) {
          console.log(
            `Failures detected in ${spec.relative}: ${results.stats.failures}`
          );
        }
      });
      return config; // Return the updated config for cypress
    },
  },
  e2e: {
    baseUrl:
      process.env.CYPRESS_STAGING_BASE_URL ||
      "https://friends-without-benefits-1.onrender.com",
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/reports",
      reportFilename: `results-e2e-${
        process.env.NODE_VERSION || "mochawesome.json"
      }`, // Dynamically name the report with fallback
      overwrite: true,
      html: false,
      json: true,
    },
    setupNodeEvents(on, config) {
      // Hook to rename the report file dynamically
      on("after:run", () => {
        const nodeVersion = process.env.NODE_VERSION || "unknown-version";
        const reportsDir =
          config.reporterOptions.reportDir || "cypress/reports";
        const oldFilename = join(reportsDir, "mochawesome.json");
        const newFilename = join(reportsDir, `results-e2e-${nodeVersion}.json`);
        try {
          // Use renameSync to rename the file synchronously to ensure it's available
          renameSync(oldFilename, newFilename);
          console.log(`Renamed report to: ${newFilename}`);
        } catch (err) {
          console.error(`Error renaming file: ${err.message}`);
        }
      });
      return config;
    },
  },
});
