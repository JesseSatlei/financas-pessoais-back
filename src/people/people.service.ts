import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { Person } from '../domain/types';
import { PersonEntity } from './person.entity';

type PersonInput = Omit<Person, 'id' | 'createdAt'>;

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly people: Repository<PersonEntity>,
  ) {}

  async list(userId: string): Promise<Person[]> {
    const people = await this.people.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return people.map((person) => this.toPublicPerson(person));
  }

  async add(userId: string, input: PersonInput): Promise<Person> {
    this.validate(input);
    await this.ensureUniqueName(userId, input.name);
    const person = this.people.create({
      userId,
      name: input.name.trim(),
      notes: input.notes?.trim() || undefined,
    });
    return this.toPublicPerson(await this.people.save(person));
  }

  async update(userId: string, id: string, input: PersonInput): Promise<Person> {
    this.validate(input);
    const person = await this.people.findOne({ where: { userId, id } });
    if (!person) throw new NotFoundException('Pessoa nao encontrada');
    await this.ensureUniqueName(userId, input.name, id);
    person.name = input.name.trim();
    person.notes = input.notes?.trim() || undefined;
    return this.toPublicPerson(await this.people.save(person));
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const result = await this.people.delete({ userId, id });
    if (!result.affected) throw new NotFoundException('Pessoa nao encontrada');
    return { ok: true };
  }

  private validate(input: PersonInput): void {
    if (!input.name?.trim()) throw new BadRequestException('Nome invalido');
  }

  private async ensureUniqueName(
    userId: string,
    name: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.people.findOne({
      where: { userId, name: ILike(name.trim()) },
    });
    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException('Essa pessoa ja foi cadastrada');
    }
  }

  private toPublicPerson(person: PersonEntity): Person {
    return {
      id: person.id,
      name: person.name,
      notes: person.notes,
      createdAt: person.createdAt.getTime(),
    };
  }
}
