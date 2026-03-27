

# 📑 Especificações Técnicas e Governança do Projeto

Este documento define os padrões de engenharia e as responsabilidades fundamentais para a manutenção da integridade do código.

## 👥 Responsabilidades e Lead de Desenvolvimento

As decisões de arquitetura e implementação são lideradas por:

  * **Backend & API Engineering:** Daltro Oliveira Vinuto
  * **Frontend & Client-Side Architecture:** Kyara Esteves de Sousa

-----

## 🛠 Padrão de Commits (Conventional Commits 1.0.0)

Seguimos a especificação oficial para garantir um histórico de Git estruturado, permitindo a automação de *SemVer* (Semantic Versioning) e geração de *Changelogs*.

### Estrutura do Commit

```text
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos de Commit (Lista Completa)

| Tipo | Descrição |
| :--- | :--- |
| **feat** | Uma nova funcionalidade (corresponde a `MINOR` no SemVer). |
| **fix** | Correção de um erro/bug (corresponde a `PATCH` no SemVer). |
| **build** | Alterações que afetam o sistema de build ou dependências externas (ex: npm, gulp, docker). |
| **ci** | Alterações em arquivos e scripts de configuração de CI (ex: GitHub Actions, Travis). |
| **docs** | Alterações exclusivas na documentação. |
| **style** | Mudanças que não afetam o sentido do código (espaços, formatação, linting). |
| **refactor** | Alteração de código que não corrige bug nem adiciona funcionalidade. |
| **perf** | Mudança de código que melhora o desempenho. |
| **test** | Adição de testes ausentes ou correção de testes existentes. |
| **chore** | Outras alterações que não modificam arquivos de `src` ou `test` (ex: .gitignore). |
| **revert** | Reverte um commit anterior. |

### ⚠️ Breaking Changes (Alterações Quebrantes)

Para indicar uma alteração que quebra a compatibilidade com versões anteriores (`MAJOR` no SemVer), deve-se adicionar um `!` após o tipo/escopo ou incluir `BREAKING CHANGE:` no rodapé.

*Exemplo:* `feat(api)!: alterar endpoint de login para v2`

-----

## 🚀 Gestão e Planejamento

Todo o fluxo de trabalho, desde a ideação até o deploy, é rastreado via Trello. Nenhuma tarefa deve ser iniciada sem estar devidamente documentada no board.

-----

## 📋 Diretrizes de Qualidade

1.  **Commits Atômicos:** Cada commit deve representar uma única unidade lógica de trabalho.
2.  **Mensagens Claras:** Use o imperativo ("add" em vez de "added"). Ex: `feat(ui): add button component`.
3.  **Escopos:** Utilize escopos para dar contexto, como `(backend)`, `(frontend)`, `(auth)`, `(db)`.

-----

