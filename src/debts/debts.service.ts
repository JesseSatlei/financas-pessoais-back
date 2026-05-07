import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Debt } from '../domain/types';
import { DebtEntity } from './debt.entity';

type DebtInput = Omit<Debt, 'id' | 'createdAt'>;

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(DebtEntity)
    private readonly debts: Repository<DebtEntity>,
  ) {}

  async list(userId: string): Promise<Debt[]> {
    const debts = await this.debts.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return debts.map((debt) => this.toPublicDebt(debt));
  }

  async add(userId: string, input: DebtInput): Promise<Debt> {
    this.validate(input);
    const debt = this.debts.create({
      userId,
      direction: input.direction,
      person: input.person.trim(),
      amount: Number(input.amount).toFixed(2),
      paidAmount: Number(input.paidAmount ?? 0).toFixed(2),
      description: input.description?.trim() || undefined,
      dueDate: input.dueDate || undefined,
    });
    return this.toPublicDebt(await this.debts.save(debt));
  }

  async update(userId: string, id: string, input: DebtInput): Promise<Debt> {
    this.validate(input);
    const debt = await this.debts.findOne({ where: { userId, id } });
    if (!debt) throw new NotFoundException('Divida nao encontrada');

    debt.direction = input.direction;
    debt.person = input.person.trim();
    debt.amount = Number(input.amount).toFixed(2);
    debt.paidAmount = Number(input.paidAmount ?? 0).toFixed(2);
    debt.description = input.description?.trim() || undefined;
    debt.dueDate = input.dueDate || undefined;

    return this.toPublicDebt(await this.debts.save(debt));
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const result = await this.debts.delete({ userId, id });
    if (!result.affected) throw new NotFoundException('Divida nao encontrada');
    return { ok: true };
  }

  private validate(input: DebtInput): void {
    if (!['i_owe', 'owed_to_me'].includes(input.direction)) {
      throw new BadRequestException('Tipo de divida invalido');
    }
    if (!input.person?.trim()) throw new BadRequestException('Pessoa invalida');
    if (!Number.isFinite(Number(input.amount)) || Number(input.amount) <= 0) {
      throw new BadRequestException('Valor invalido');
    }
    if (
      !Number.isFinite(Number(input.paidAmount ?? 0)) ||
      Number(input.paidAmount ?? 0) < 0 ||
      Number(input.paidAmount ?? 0) > Number(input.amount)
    ) {
      throw new BadRequestException('Valor pago invalido');
    }
    if (input.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
      throw new BadRequestException('Data invalida');
    }
  }

  private toPublicDebt(debt: DebtEntity): Debt {
    return {
      id: debt.id,
      direction: debt.direction,
      person: debt.person,
      amount: Number(debt.amount),
      paidAmount: Number(debt.paidAmount),
      description: debt.description,
      dueDate: debt.dueDate,
      createdAt: debt.createdAt.getTime(),
    };
  }
}
