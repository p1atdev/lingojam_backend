import { initializeApp, AppOptions, cert } from "firebase-admin/app"
import { load } from "ts-dotenv"

const env = load({
    FIREBASE_ADMIN_PROJECT_ID: String,
    FIREBASE_ADMIN_CLIENT_EMAIL: String,
    FIREBASE_ADMIN_PRIVATE_KEY: String,
})

const firebaseConfig: AppOptions = {
    credential: cert({
        projectId: env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
}

export const admin = initializeApp(firebaseConfig)
