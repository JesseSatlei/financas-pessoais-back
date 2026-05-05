import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_CATEGORIES, ENTRY_TYPES } from '../domain/constants';
import type { CategoriesByType, EntryType } from '../domain/types';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
  ) {}

  async list(userId: string): Promise<CategoriesByType> {
    return this.ensureCategories(userId);
  }

  async add(
    userId: string,
    type: EntryType,
    name: string,
  ): Promise<CategoriesByType> {
    this.assertType(type);
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Nome invalido');

    const categories = await this.ensureCategories(userId);
    if (
      categories[type].some(
        (item) => item.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      throw new BadRequestException('Categoria ja existe');
    }

    await this.categories.save(
      this.categories.create({ userId, type, name: trimmed }),
    );
    return this.ensureCategories(userId);
  }

  async remove(
    userId: string,
    type: EntryType,
    name: string,
  ): Promise<CategoriesByType> {
    this.assertType(type);
    const category = await this.categories.findOne({
      where: { userId, type, name },
    });
    if (!category) {
      throw new NotFoundException('Categoria nao encontrada');
    }

    await this.categories.remove(category);
    return this.ensureCategories(userId);
  }

  private async ensureCategories(userId: string): Promise<CategoriesByType> {
    const existing = await this.categories.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    if (existing.length === 0) {
      const defaults = ENTRY_TYPES.flatMap((type) =>
        DEFAULT_CATEGORIES[type].map((name) =>
          this.categories.create({ userId, type, name }),
        ),
      );
      await this.categories.save(defaults);
      return structuredClone(DEFAULT_CATEGORIES);
    }

    return existing.reduce<CategoriesByType>(
      (acc, category) => {
        acc[category.type].push(category.name);
        return acc;
      },
      { expense: [], income: [], investment: [] },
    );
  }

  private assertType(type: EntryType): void {
    if (!ENTRY_TYPES.includes(type)) {
      throw new BadRequestException('Tipo invalido');
    }
  }
}
