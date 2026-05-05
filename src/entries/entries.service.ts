import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ENTRY_TYPES } from '../domain/constants';
import type { Entry } from '../domain/types';
import { EntryEntity } from './entry.entity';

type CreateEntry = Omit<Entry, 'id' | 'createdAt'>;

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(EntryEntity)
    private readonly entries: Repository<EntryEntity>,
  ) {}

  async list(userId: string): Promise<Entry[]> {
    const entries = await this.entries.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entries.map((entry) => this.toPublicEntry(entry));
  }

  async add(userId: string, input: CreateEntry): Promise<Entry> {
    this.validate(input);
    const entry = this.entries.create({
      userId,
      type: input.type,
      amount: Number(input.amount).toFixed(2),
      category: input.category.trim(),
      description: input.description?.trim() || undefined,
      date: input.date,
      account: input.account?.trim() || undefined,
    });

    const saved = await this.entries.save(entry);
    return this.toPublicEntry(saved);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const result = await this.entries.delete({ userId, id });
    if (!result.affected)
      throw new NotFoundException('Lancamento nao encontrado');
    return { ok: true };
  }

  async seedIfEmpty(userId: string, sample: Entry[]): Promise<{ ok: true }> {
    const count = await this.entries.count({ where: { userId } });
    if (count === 0 && Array.isArray(sample)) {
      const entries = sample.map((entry) =>
        this.entries.create({
          userId,
          type: entry.type,
          amount: Number(entry.amount).toFixed(2),
          category: entry.category,
          description: entry.description,
          date: entry.date,
          account: entry.account,
          createdAt: new Date(entry.createdAt || Date.now()),
        }),
      );
      await this.entries.save(entries);
    }
    return { ok: true };
  }

  private validate(input: CreateEntry): void {
    if (!ENTRY_TYPES.includes(input.type)) {
      throw new BadRequestException('Tipo invalido');
    }
    if (!Number.isFinite(Number(input.amount)) || Number(input.amount) <= 0) {
      throw new BadRequestException('Valor invalido');
    }
    if (!input.category?.trim())
      throw new BadRequestException('Categoria invalida');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      throw new BadRequestException('Data invalida');
    }
  }

  private toPublicEntry(entry: EntryEntity): Entry {
    return {
      id: entry.id,
      type: entry.type,
      amount: Number(entry.amount),
      category: entry.category,
      description: entry.description,
      date: entry.date,
      account: entry.account,
      createdAt: entry.createdAt.getTime(),
    };
  }
}
