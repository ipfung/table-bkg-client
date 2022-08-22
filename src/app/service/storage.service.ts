import { Preferences } from '@capacitor/preferences';

export async function set(key: string, value: string): Promise<void> {
    await Preferences.set({
        key: key,
        value: value
    });
}

export async function get(key: string): Promise<any> {
    const item = await Preferences.get({ key: key });
    return item.value;
}

export async function remove(key: string): Promise<void> {
    await Preferences.remove({
        key: key,
    });
}
