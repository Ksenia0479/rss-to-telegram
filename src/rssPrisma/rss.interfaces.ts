import { User, Setting, Rss } from '@prisma/client';

export interface SettingWithUser extends Setting {
  user: User;
}

export interface UserWithSetting extends User {
  setting: Setting;
}

export interface RssWithUserAndSetting extends Rss {
  user: UserWithSetting;
}

export interface UserWithRssAndSetting extends User {
  Rss: Rss[];
  setting: Setting;
}

export enum LangCode3 {
  en = 'en',
  ru = 'ru',
  es = 'es',
  fr = 'fr',
  de = 'de',
  ja = 'ja',
  it = 'it',
  pt = 'pt',
  zh = 'zh',
}

export type LangCode2 =
  | 'en'
  | 'ru'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja'
  | 'it'
  | 'pt'
  | 'zh';
