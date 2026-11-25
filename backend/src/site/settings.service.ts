import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../entities';
import { DEFAULT_SETTINGS } from './default-settings';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectRepository(SiteSetting) private repo: Repository<SiteSetting>) {}

  /** Insert any missing default keys (never overwrites edited values). */
  async onModuleInit() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await this.repo.createQueryBuilder().insert().values({ key, value: value as any }).orIgnore().execute();
    }
  }

  async getAll(): Promise<Record<string, Record<string, unknown>>> {
    const rows = await this.repo.find();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async set(key: string, value: Record<string, unknown>) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) throw new NotFoundException(`Unknown setting "${key}"`);
    await this.repo.save({ key, value });
    return { key, value };
  }
}
