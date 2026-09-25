# Caderno OAB - Sprint 1

Base estática do Caderno OAB, preparada para GitHub Pages.

## O que já existe

- Dashboard inicial responsivo
- Menu lateral com navegação entre áreas
- Indicadores de progresso
- Próxima questão sugerida
- Persistência local com `localStorage`
- Base JSON com 60 questões placeholder
- Compatibilidade com GitHub Pages, sem backend

## Estrutura

```text
caderno-oab-sprint1/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── questoes.json
├── assets/
└── README.md
```

## Teste local

Por usar `fetch()` para carregar o JSON, abra a pasta por um servidor local.

### Python

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

### VS Code

Também funciona com a extensão Live Server.

## Publicar no GitHub Pages

1. Crie ou abra o repositório do projeto.
2. Envie todo o conteúdo desta pasta para a raiz do repositório.
3. No GitHub, abra **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`.
6. Salve.

O site usará caminhos relativos (`./`), portanto funciona em repositórios do tipo `usuario.github.io/caderno-oab/`.

## Próximo Sprint sugerido

Sprint 2: Banco de questões + tela individual de resolução + status da questão.
