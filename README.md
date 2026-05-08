# Back - API Financas Pessoais

API NestJS para o app Bolso.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- JWT
- bcryptjs

## Principais modulos

- `auth`: cadastro, login, JWT e usuario atual.
- `admin`: seed do admin, aprovacao de usuarios e controle de mensalidades.
- `subscription`: assinatura recorrente mensal.
- `entries`: lancamentos de renda, gasto e investimento.
- `debts`: dividas, status e divisao com pessoas.
- `recurring-bills`: contas fixas, meses pagos e valor variavel.
- `people`: pessoas cadastradas para divisao.
- `categories`: categorias por tipo de lancamento.

## Assinatura

Valor mensal: R$ 90.

Estados:

- `none`: usuario ainda nao informou pagamento.
- `pending`: usuario informou pagamento ou periodo venceu, mas admin ainda nao confirmou.
- `active`: admin confirmou pagamento; acesso valido ate `nextBillingAt`.

Usuarios admin nao dependem de assinatura para acessar o sistema.

## Admin local

O admin e criado no startup via variaveis:

```env
ADMIN_ENABLED=true
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@bolso.local
ADMIN_PASSWORD=change-me
ADMIN_ROTATE_PASSWORD=false
```

O arquivo `.env` local ja foi criado com essas variaveis e parametros de banco padrao.

## Endpoints admin relevantes

- `GET /admin/users`: lista usuarios com dados de assinatura.
- `PATCH /admin/users/:id/approval`: aprova ou bloqueia usuario.
- `PATCH /admin/users/:id/subscription`: marca usuario como pago ou nao pago no periodo.

## Comandos

```bash
npm install
npm run start:dev
npm run build
```
