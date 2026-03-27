
# 🏫 Sistema de Controle de Acesso e Voucher Escolar

## 👥 Autores e Responsabilidades

  * **Backend & API Engineering:** [Daltro Oliveira Vinuto](https://github.com/Daltro-Oliveira-Vinuto)
  * **Frontend & Client-Side Architecture:** [Kyara Esteves de Sousa](https://github.com/Kyara2)

-----

## 📝 Visão Geral do Projeto

O objetivo central deste sistema é gerenciar o controle de acesso e a validação de vouchers de refeição em escolas públicas de forma automatizada e segura. O sistema utiliza a **identificação biométrica** (impressão digital) como o principal mecanismo para garantir que cada estudante usufrua de apenas uma refeição por dia, com renovação automática do direito à meia-noite.

### Escopo e Funcionalidades Principais

  * **Validação Híbrida:** Identificação via leitor biométrico com mecanismo de *fallback* manual (nome + matrícula) acompanhado de confirmação visual por foto.
  * **Gestão de Perfis:** Atendimento a múltiplos papéis, incluindo Operadores (cantina), Empresas (fornecedores), Fiscais (órgão público) e Gestão Escolar.
  * **Transparência e Auditoria:** Geração de relatórios detalhados para faturamento baseado no consumo real e dashboards de monitoramento em tempo real.
  * **Segurança de Dados:** O sistema não armazena a imagem da digital, apenas o código hexadecimal gerado pelo leitor, garantindo a privacidade dos dados biométricos dos alunos.

-----

## ⚙️ Decisões Técnicas e Padrões

Para detalhes sobre a arquitetura do sistema, padrões de código e a especificação completa de commits utilizada pela equipe, consulte o nosso documento oficial:

👉 **[Acesse aqui: docs/TECHNICAL\_DECISIONS.md](/docs/TECHNICAL_DECISIONS.md)**

-----

## 🚀 Gestão e Acompanhamento

O planejamento das sprints e o status das funcionalidades (Requisitos Funcionais e Não Funcionais) podem ser acompanhados através do nosso quadro operacional no Trello.

🔗 **[Quadro do Projeto no Trello](https://projeto-controle-de-acesso.atlassian.net/jira/software/projects/PCDA/boards/2?atlOrigin=eyJpIjoiYzU5MWU3YzU0NzkyNDUyMDk0YjNkMWVkNDBhYmQyMWMiLCJwIjoiaiJ9)**
👉 **[Acesse aqui: docs/TECHNICAL\_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md)**