import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { MenuItem, SpecialOffer, Discount, Event, Review, Award, Chef, Branch, AddonCategory, FAQ } from '../types';

const STORAGE_DIRECTORY = Directory.Documents;
const ROOT_FOLDER = 'MenuManager';
const DATA_FILE = 'menu.json';
const APP_DATA_FILE = 'app_config.json';

export interface AppData {
    offers: SpecialOffer[];
    discounts: Discount[];
    events: Event[];
    reviews: Review[];
    awards: Award[];
    chefs: Chef[];
    branches: Branch[];
    categoryOrder?: string[];
    isAiEnabled?: boolean;
    addonCategories?: AddonCategory[];
    faqs?: FAQ[];
}

const getFileNameOnly = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    
    try {
        const decodedPath = decodeURIComponent(path);
        const parts = decodedPath.split(/[\/\\]/);
        const filename = parts.pop();
        return filename || path;
    } catch (e) {
        return path;
    }
};

const getWebviewPath = async (filename: string): Promise<string> => {
    if (!filename) return '';
    if (!Capacitor.isNativePlatform()) return filename; 
    
    if (filename.startsWith('data:') || filename.startsWith('http') || filename.startsWith('capacitor://') || filename.startsWith('file://')) return filename;

    try {
        const uri = await Filesystem.getUri({
            path: `${ROOT_FOLDER}/${filename}`,
            directory: STORAGE_DIRECTORY
        });
        return Capacitor.convertFileSrc(uri.uri);
    } catch (e) {
        return filename;
    }
};

export const loadExternalData = async (): Promise<MenuItem[]> => {
  if (!Capacitor.isNativePlatform()) {
      const local = localStorage.getItem('menu_data');
      if (!local) return [];
      try {
          const parsed = JSON.parse(local);
          return Array.isArray(parsed) ? parsed : (parsed?.items || []);
      } catch {
          return [];
      }
  }
  
  try {
    try { await Filesystem.mkdir({ path: ROOT_FOLDER, directory: STORAGE_DIRECTORY, recursive: true }); } catch (e) {}

    const readFile = await Filesystem.readFile({
      path: `${ROOT_FOLDER}/${DATA_FILE}`,
      directory: STORAGE_DIRECTORY,
      encoding: Encoding.UTF8,
    });

    const dataString = typeof readFile.data === 'string' ? readFile.data : JSON.stringify(readFile.data);
    let parsedData: any = JSON.parse(dataString);

    if (!Array.isArray(parsedData)) {
        parsedData = parsedData?.items || [];
    }

    const resolvedItems = await Promise.all((parsedData as MenuItem[]).map(async (item) => ({
        ...item,
        photo_link: await getWebviewPath(item.photo_link),
        video_link: await getWebviewPath(item.video_link),
    })));

    return resolvedItems;
  } catch (error) {
    return [];
  }
};

export const saveData = async (items: MenuItem[]) => {
    if (!Capacitor.isNativePlatform()) {
        try { localStorage.setItem('menu_data', JSON.stringify(items)); } catch (e) { console.error(e); }
        return;
    }

    try {
        const storageItems = items.map(item => ({
            ...item, 
            photo_link: getFileNameOnly(item.photo_link),
            video_link: getFileNameOnly(item.video_link)
        }));

        await Filesystem.writeFile({
            path: `${ROOT_FOLDER}/${DATA_FILE}`,
            data: JSON.stringify(storageItems, null, 2),
            directory: STORAGE_DIRECTORY,
            encoding: Encoding.UTF8
        });
    } catch (e) {
        console.error("Failed to save menu data", e);
    }
};

export const loadAppData = async (): Promise<AppData | null> => {
    if (!Capacitor.isNativePlatform()) {
        const local = localStorage.getItem('app_data');
        return local ? JSON.parse(local) : null;
    }

    try {
        const readFile = await Filesystem.readFile({
            path: `${ROOT_FOLDER}/${APP_DATA_FILE}`,
            directory: STORAGE_DIRECTORY,
            encoding: Encoding.UTF8,
        });
        const dataString = typeof readFile.data === 'string' ? readFile.data : JSON.stringify(readFile.data);
        const parsed = JSON.parse(dataString);
        
        if (parsed.chefs) parsed.chefs = await Promise.all(parsed.chefs.map(async (c: Chef) => ({...c, image: await getWebviewPath(c.image)})));
        if (parsed.events) parsed.events = await Promise.all(parsed.events.map(async (e: Event) => ({...e, image: await getWebviewPath(e.image)})));
        if (parsed.offers) parsed.offers = await Promise.all(parsed.offers.map(async (o: SpecialOffer) => ({...o, image: await getWebviewPath(o.image)})));
        if (parsed.branches) parsed.branches = await Promise.all(parsed.branches.map(async (b: Branch) => ({...b, map_image: await getWebviewPath(b.map_image)})));

        return parsed;
    } catch (e) {
        return null;
    }
};

export const saveAppData = async (data: AppData) => {
    if (!Capacitor.isNativePlatform()) {
        localStorage.setItem('app_data', JSON.stringify(data));
        return;
    }

    try {
        const cleanedData = {
            ...data,
            chefs: data.chefs.map(c => ({...c, image: getFileNameOnly(c.image)})),
            events: data.events.map(e => ({...e, image: getFileNameOnly(e.image)})),
            offers: data.offers.map(o => ({...o, image: getFileNameOnly(o.image)})),
            branches: data.branches.map(b => ({...b, map_image: getFileNameOnly(b.map_image)})),
        };

        await Filesystem.writeFile({
            path: `${ROOT_FOLDER}/${APP_DATA_FILE}`,
            data: JSON.stringify(cleanedData, null, 2),
            directory: STORAGE_DIRECTORY,
            encoding: Encoding.UTF8
        });
    } catch (e) {
        console.error("Failed to save app data", e);
    }
};

export const saveLargeMediaToDevice = async (base64Data: string): Promise<string> => {
    if (!Capacitor.isNativePlatform() || base64Data.startsWith('http')) return base64Data; 
    const ext = 'mp4';
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const fullPath = `${ROOT_FOLDER}/${fileName}`;

    try {
        const dataToWrite = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        await Filesystem.writeFile({ path: fullPath, data: '', directory: STORAGE_DIRECTORY });

        const chunkSize = 512 * 1024; 
        const length = dataToWrite.length;
        let offset = 0;

        while (offset < length) {
            const chunk = dataToWrite.slice(offset, offset + chunkSize);
            await Filesystem.appendFile({ path: fullPath, data: chunk, directory: STORAGE_DIRECTORY });
            offset += chunkSize;
        }
        
        return await getWebviewPath(fileName);
    } catch (e) {
        return base64Data; 
    }
};

export const saveMediaToDevice = async (base64Data: string, type: 'image' | 'video'): Promise<string> => {
    if (base64Data.startsWith('http')) return base64Data;
    if (type === 'video') return saveLargeMediaToDevice(base64Data);
    if (!Capacitor.isNativePlatform()) return base64Data; 

    const ext = 'jpg';
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const fullPath = `${ROOT_FOLDER}/${fileName}`;

    try {
        const dataToWrite = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        await Filesystem.writeFile({
            path: fullPath,
            data: dataToWrite,
            directory: STORAGE_DIRECTORY,
        });
        return await getWebviewPath(fileName);
    } catch (e) {
        return base64Data; 
    }
};

export const exportData = async (menuItems: MenuItem[] = [], appData: AppData, onProgress?: (percent: number) => void) => {
    const date = new Date();
    const timestamp = date.toISOString().split('T')[0];
    const exportFileName = `AF_Restro_Backup_${timestamp}.json`;

    if (onProgress) onProgress(10);

    try {
        const dataToExport = {
            items: menuItems.map(i => ({ ...i, photo_link: getFileNameOnly(i.photo_link), video_link: getFileNameOnly(i.video_link) })),
            appData: {
                ...appData,
                chefs: appData.chefs.map(c => ({ ...c, image: getFileNameOnly(c.image) })),
                events: appData.events.map(e => ({ ...e, image: getFileNameOnly(e.image) })),
                offers: appData.offers.map(o => ({ ...o, image: getFileNameOnly(o.image) })),
                branches: appData.branches.map(b => ({ ...b, map_image: getFileNameOnly(b.map_image) }))
            }
        };

        if (onProgress) onProgress(50);

        if (!Capacitor.isNativePlatform()) {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = exportFileName;
            a.click();
            if (onProgress) onProgress(100);
            return;
        }

        const cachePath = exportFileName;
        await Filesystem.writeFile({
            path: cachePath,
            data: JSON.stringify(dataToExport, null, 2),
            directory: Directory.Cache,
            encoding: Encoding.UTF8
        });

        if (onProgress) onProgress(80);

        const fileUri = await Filesystem.getUri({ directory: Directory.Cache, path: cachePath });

        await Share.share({
            title: 'Menu JSON Backup',
            text: 'Text-only JSON. Manually copy MenuManager folder for photos.',
            files: [fileUri.uri], 
            dialogTitle: 'Save Backup'
        });
        
        if (onProgress) onProgress(100);
    } catch (error) {
        console.error("Export failed", error);
        alert('Export failed: ' + (error as any).message);
    }
};

export { ROOT_FOLDER };