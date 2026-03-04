
export const envConfig = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    API_BASE_URL: process.env.API_BASE_URL,
    database: {
        url: process.env.DATABASE_URL,
    },
    google: {
        issuerId: process.env.GOOGLE_ISSUER_ID,
        classId: process.env.GOOGLE_CLASS_ID,
        serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
    apple: {
        teamId: process.env.APPLE_TEAM_ID,
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER,
        certPath: process.env.APPLE_CERT_PATH,
        keyPath: process.env.APPLE_KEY_PATH,
        wwdrPath: process.env.APPLE_WWDR_PATH,
        certPassphrase: process.env.APPLE_CERT_PASSPHRASE,
        apnKeyId: process.env.APPLE_APN_KEY_ID,
        apnTeamId: process.env.APPLE_APN_TEAM_ID,
        apnTopic: process.env.APPLE_APN_TOPIC,
    },
    pass: {
        organizationName: process.env.PASS_ORGANIZATION_NAME,
        description: process.env.PASS_DESCRIPTION,
        logoUrl: process.env.PASS_LOGO_URL,
    },
    rewards: {
        pointsPerScan: parseInt(process.env.REWARD_POINTS_PER_SCAN || '10', 10),
        baseQuantity: parseInt(process.env.REWARD_BASE_QUANTITY || '10', 10),
    },
    admin: {
        jwtSecret: process.env.ADMIN_JWT_SECRET,
        email: process.env.ADMIN_EMAIL,
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
    },
    s3: {
        bucketName: process.env.S3_BUCKET_NAME,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
    },
});
