import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkEnvVars() {
  const requiredVars = [
    "LIVE100MS_APP_SECRET",
    "LIVE100MS_APP_ACCESS_KEY",
    "NEXT_PUBLIC_FIREBASE_APIKEY",
    "NEXT_PUBLIC_FIREBASE_AUTHDOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECTID",
    "NEXT_PUBLIC_FIREBASE_STORAGEBUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID",
    "NEXT_PUBLIC_FIREBASE_APPID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENTID",
  ];

  const missingVars = requiredVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(
      "Missing required environment variables:",
      missingVars.join(", "),
    );
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
}

function checkServiceAccountConfigFile() {
  const filePath = path.join(__dirname, "src", "config", "firebase");

  if (!fs.existsSync(filePath)) {
    console.error(
      `Firebase service account config file is missing at: ${filePath}`,
    );
    throw new Error(`Firebase service account config file is missing.`);
  }
}

checkEnvVars();
checkServiceAccountConfigFile();
