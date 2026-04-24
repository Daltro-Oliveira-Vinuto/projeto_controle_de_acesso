# 🏫 Sistema de Controle de Acesso e Voucher Escolar

## 👥 Autores e Responsabilidades

* **Backend & API Engineering:** [Daltro Oliveira Vinuto](https://github.com/Daltro-Oliveira-Vinuto)
* **Frontend & Client-Side Architecture:** [Kyara Esteves de Sousa](https://github.com/Kyara2)

---

## 📝 Visão Geral do Projeto

O objetivo central deste sistema é gerenciar o controle de acesso e a validação de vouchers de refeição em escolas públicas de forma automatizada e segura. O sistema utiliza a **identificação biométrica** (impressão digital) como o principal mecanismo para garantir que cada estudante usufrua de apenas uma refeição por dia, com renovação automática do direito à meia-noite.

* **Validação Híbrida:** Identificação via leitor biométrico com *fallback* manual (nome + matrícula) e confirmação visual por foto.
* **Gestão de Perfis:** Operadores (cantina), Empresas (fornecedores), Fiscais (órgão público) e Gestão Escolar.
* **Transparência e Auditoria:** Relatórios de faturamento e dashboards em tempo real.
* **Segurança de Dados:** Apenas o código hexadecimal da digital é armazenado — nunca a imagem biométrica.

---

## ⚙️ Decisões Técnicas e Padrões

👉 **[docs/TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md)**

---

## 🚀 Gestão e Acompanhamento

🔗 **[Quadro Kanban do Projeto](https://projeto-controle-de-acesso.atlassian.net/jira/software/projects/PCDA/boards/2?atlOrigin=eyJpIjoiYzU5MWU3YzU0NzkyNDUyMDk0YjNkMWVkNDBhYmQyMWMiLCJwIjoiaiJ9)**

---

## 🌐 Deploy

| Serviço | URL |
|---|---|
| Frontend (Render) | `em breve` |
| Backend (Render) | `em breve` |

---

## 🛠️ Instalação

### Pré-requisitos

| Ferramenta | Versão mínima | Verificação |
|---|---|---|
| Node.js | >= 18 | `node -v` |
| npm | (incluso com Node.js) | `npm -v` |
| Python | >= 3.10 | `python3 --version` |
| pip | (incluso com Python) | `pip --version` |
| PostgreSQL | >= 14 | `psql --version` |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponível localmente em **http://localhost:5173**

### Backend

```bash
cd backend
pip install poetry   # caso ainda não tenha
poetry install
poetry run python3 manage.py migrate
poetry run python3 manage.py runserver
```

Disponível localmente em **http://localhost:8000**

Crie um arquivo `.env` dentro de `backend/`:

```env
DEBUG=True para rodar localmente e False para Deploy na Cloud
NAME=nome do banco de dados
USER=nome do usuário
PASSWORD= senha do banco de dados
HOST= caminho do banco de dados
PORT= porta do banco de dados
```

> Para produção no Render, a variável `DATABASE_URL` é gerada automaticamente ao vincular o serviço de banco de dados PostgreSQL no painel do Render.

---

## 📋 Sprints

| Sprint | Foco | Status |
|---|---|---|
| 1 | Configuração do ambiente e versionamento |  DONE |
| 2 | Autenticação e controle de papéis com Google OAuth | DONE |
| 3 | Gestão de estudantes — cadastro individual | 🔧 DONE |
| 4 | Gestão de estudantes — cadastro em lote e digitais | ⏳ working on it |
| 5 | Integração com leitor biométrico | ⏳ Aguardando |
| 6 | Regras de voucher e validação completa | ⏳ Aguardando |
| 7 | Liberação manual com foto e motivo | ⏳ Aguardando |
| 8 | Dashboard em tempo real para empresa | ⏳ Aguardando |
| 9 | Dashboards para fiscal e gestão | ⏳ Aguardando |
| 10 | Relatórios e exportação | ⏳ Aguardando |
| 11 | Validação fiscal, ocorrências e configurações | ⏳ Aguardando |
| 12 | Testes, documentação e deploy | ⏳ Aguardando |