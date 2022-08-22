import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.jws.lemonade.appointment',
    appName: 'Lemonade Appointment',
    webDir: 'dist',
    bundledWebRuntime: false,
    plugins: {
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
    },
    "server": {
        "cleartext": true
    },
};

export default config;

