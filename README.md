# Caderno OAB — Sprint 2

Aplicação estática, mobile-first, para estudo da 2ª fase da OAB em Direito do Trabalho.

## Entregas do Sprint 2

- Banco de 60 questões com busca por palavra-chave.
- Filtros por status: Todas, Novas, Resolvidas e Revisar.
- Tela completa de treino com enunciado, itens A/B e navegação entre questões.
- Cronômetro opcional por sessão.
- Marcação de questão resolvida e fila de revisão.
- Autoavaliação simples: ainda não sei, parcial ou boa.
- Dashboard calculado automaticamente a partir do status de cada questão.
- Persistência no navegador com `localStorage`.
- Migração automática do progresso simples do Sprint 1, quando existente.
- Interface responsiva para desktop e mobile.

## Importante sobre os enunciados

O conteúdo incluído neste Sprint é um banco demonstrativo de treino, criado para validar a experiência do aplicativo. Ele não reproduz questões oficiais da FGV. O próximo passo de conteúdo pode substituir esses registros por dados oficiais/organizados, mantendo a mesma interface.

## Publicar no GitHub Pages

Coloque os arquivos na raiz do repositório e ative:

`Settings → Pages → Deploy from a branch → main → / (root)`

A estrutura deve ficar assim:

```text
/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── questoes.json
└── README.md
```

> Para testar localmente, prefira servir a pasta via HTTP (por exemplo, extensão Live Server), porque alguns navegadores bloqueiam `fetch()` de JSON ao abrir `index.html` diretamente por `file://`.
