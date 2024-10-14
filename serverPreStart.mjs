// Manually define __dirname for ES modules

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

checkEnvVars();
