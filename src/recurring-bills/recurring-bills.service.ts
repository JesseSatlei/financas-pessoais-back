import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RecurringBill } from '../domain/types';
import { RecurringBillEntity } from './recurring-bill.entity';

type RecurringBillInput = Omit<RecurringBill, 'id' | 'createdAt'>;

@Injectable()
export class RecurringBillsService {
  constructor(
    @InjectRepository(RecurringBillEntity)
    private readonly bills: Repository<RecurringBillEntity>,
  ) {}

  async list(userId: string): Promise<RecurringBill[]> {
    const bills = await this.bills.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return bills.map((bill) => this.toPublicBill(bill));
  }

  async add(userId: string, input: RecurringBillInput): Promise<RecurringBill> {
    this.validate(input);
    const bill = this.bills.create({
      userId,
      title: input.title.trim(),
      amount: Number(input.amount).toFixed(2),
      category: input.category.trim(),
      dueDay: Number(input.dueDay),
      account: input.account?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      active: input.active ?? true,
      splitWith: input.splitWith?.trim() || undefined,
      splitAmount: input.splitAmount
        ? Number(input.splitAmount).toFixed(2)
        : undefined,
      paidMonths: input.paidMonths ?? [],
    });
    return this.toPublicBill(await this.bills.save(bill));
  }

  async update(
    userId: string,
    id: string,
    input: RecurringBillInput,
  ): Promise<RecurringBill> {
    this.validate(input);
    const bill = await this.bills.findOne({ where: { userId, id } });
    if (!bill) throw new NotFoundException('Conta fixa nao encontrada');

    bill.title = input.title.trim();
    bill.amount = Number(input.amount).toFixed(2);
    bill.category = input.category.trim();
    bill.dueDay = Number(input.dueDay);
    bill.account = input.account?.trim() || undefined;
    bill.notes = input.notes?.trim() || undefined;
    bill.active = input.active ?? true;
    bill.splitWith = input.splitWith?.trim() || undefined;
    bill.splitAmount = input.splitAmount
      ? Number(input.splitAmount).toFixed(2)
      : undefined;
    bill.paidMonths = input.paidMonths ?? [];

    return this.toPublicBill(await this.bills.save(bill));
  }

  async togglePaid(
    userId: string,
    id: string,
    month: string,
    paid: boolean,
  ): Promise<RecurringBill> {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Mes invalido');
    }
    const bill = await this.bills.findOne({ where: { userId, id } });
    if (!bill) throw new NotFoundException('Conta fixa nao encontrada');

    const paidMonths = new Set(bill.paidMonths ?? []);
    if (paid) paidMonths.add(month);
    else paidMonths.delete(month);
    bill.paidMonths = Array.from(paidMonths).sort();

    return this.toPublicBill(await this.bills.save(bill));
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const result = await this.bills.delete({ userId, id });
    if (!result.affected)
      throw new NotFoundException('Conta fixa nao encontrada');
    return { ok: true };
  }

  private validate(input: RecurringBillInput): void {
    if (!input.title?.trim()) throw new BadRequestException('Titulo invalido');
    if (!Number.isFinite(Number(input.amount)) || Number(input.amount) <= 0) {
      throw new BadRequestException('Valor invalido');
    }
    if (!input.category?.trim())
      throw new BadRequestException('Categoria invalida');
    if (
      !Number.isInteger(Number(input.dueDay)) ||
      Number(input.dueDay) < 1 ||
      Number(input.dueDay) > 31
    ) {
      throw new BadRequestException('Dia de vencimento invalido');
    }
    if (input.splitWith?.trim()) {
      if (
        !Number.isFinite(Number(input.splitAmount)) ||
        Number(input.splitAmount) <= 0 ||
        Number(input.splitAmount) > Number(input.amount)
      ) {
        throw new BadRequestException('Valor da divisao invalido');
      }
    }
    if (!Array.isArray(input.paidMonths)) {
      throw new BadRequestException('Meses pagos invalidos');
    }
  }

  private toPublicBill(bill: RecurringBillEntity): RecurringBill {
    return {
      id: bill.id,
      title: bill.title,
      amount: Number(bill.amount),
      category: bill.category,
      dueDay: bill.dueDay,
      account: bill.account,
      notes: bill.notes,
      active: bill.active,
      splitWith: bill.splitWith,
      splitAmount: bill.splitAmount ? Number(bill.splitAmount) : undefined,
      paidMonths: bill.paidMonths ?? [],
      createdAt: bill.createdAt.getTime(),
    };
  }
}
