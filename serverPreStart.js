const fs = require("fs");
const path = require("path");

function checkEnvVars() {
  const requiredVars = [
    "100MS_APP_SECRET",
    "100MS_APP_ACCESS_KEY",
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
  const filePath = path.join(
    __dirname,
    "src",
    "config",
    "firebase",
    "serviceAccountConfig.json",
  );

  if (!fs.existsSync(filePath)) {
    console.error(
      'File "serviceAccountConfig.json" does not exist in src/config/firebase.',
    );
    throw new Error(
      'File "serviceAccountConfig.json" does not exist in src/config/firebase.',
    );
  }
}

checkEnvVars();
checkServiceAccountConfigFile();
