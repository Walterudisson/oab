# Caderno OAB — Sprint 3

Frontend estático para GitHub Pages, integrado ao Firebase do projeto `oabcaderno`.

## O que entrou neste Sprint

- leitura das 60 questões oficiais diretamente de `questions/` no Firestore;
- `data/questoes.json` mantido apenas como fallback de leitura;
- conclusão da resposta manuscrita libera o fluxo de correção;
- espelho oficial carregado sob demanda de `mirrors/{questionId}`;
- espelho disponível somente para usuário autenticado;
- registro de cada tentativa em `users/{uid}/attempts/{attemptId}`;
- duração do cronômetro e tempo decorrido registrados na tentativa;
- autoavaliação e marcação para revisão atualizam a tentativa mais recente;
- tentativas feitas sem conexão/sem login ficam em fila local e são enviadas após autenticação;
- progresso geral continua sincronizado em `users/{uid}/state/progress`.

## Estrutura Firestore esperada

```text
questions/
  trabalho-32-q1
  ...
  trabalho-46-q4

mirrors/
  trabalho-32-q1
  ...
  trabalho-46-q4

users/
  {uid}/
    state/
      progress
    attempts/
      {attemptId}
```

## Importante: espelhos não estão no GitHub Pages

Este pacote NÃO contém `data/espelhos.json`.

Os padrões oficiais permanecem no Firestore. A interface só consulta um espelho depois que a questão foi concluída e o estudante está autenticado.

## Regras do Firestore

O arquivo `firestore.rules` deste pacote define:

- `questions`: leitura pública, escrita bloqueada;
- `mirrors`: leitura apenas autenticada, escrita bloqueada;
- `users/{uid}` e subcoleções: somente o próprio usuário pode ler/escrever.

### Publicar as regras pelo Cloud Shell

Dentro da pasta deste Sprint:

```bash
firebase deploy --only firestore:rules --project oabcaderno
```

Também é possível copiar o conteúdo de `firestore.rules` para Firebase Console → Firestore Database → Rules e publicar.

## Publicar no GitHub Pages

Substitua no repositório os arquivos do frontend pelos arquivos desta pasta:

```text
index.html
styles.css
app.js
firebase-config.js
firebase-service.js
firestore.rules
firebase.json
data/questoes.json
assets/
```

Depois faça commit/push normalmente. O GitHub Pages continua servindo somente HTML/CSS/JS.

## Teste funcional

1. Abra o Caderno OAB publicado.
2. Entre com uma conta Firebase.
3. Abra uma questão.
4. Inicie o cronômetro, se desejar.
5. Resolva no papel.
6. Clique em `Concluí minha resposta manuscrita`.
7. Clique em `Conferir espelho FGV`.
8. Confira no Firestore:

```text
users/{seu-uid}/attempts/
```

Deve existir um novo documento com campos semelhantes a:

```text
questionId
examNumber
questionNumber
startedAt
finishedAt
durationSeconds
elapsedSeconds
status
selfEvaluation
review
mirrorViewedAt
```

## Próxima evolução sugerida

Sprint 4: histórico de tentativas, nota estimada por critério do espelho e dashboard de desempenho por tema/exame.

## Sprint 4 — Respostas do usuário

Esta versão adiciona dois modos de resolução por questão:

- **Digitada:** campos separados por item (A, B etc.), contador de caracteres e rascunho salvo automaticamente.
- **Manuscrita:** mantém o fluxo de simulação em papel sem armazenar o texto.

Ao finalizar uma resposta digitada, a tentativa enviada para `users/{uid}/attempts/{attemptId}` passa a registrar também:

```json
{
  "responseMode": "typed",
  "responses": [
    { "item": "A", "text": "..." },
    { "item": "B", "text": "..." }
  ],
  "responseCharacterCount": 1234
}
```

O último texto também permanece no estado da questão para comparação imediata com o espelho. O histórico de tentativas continua em documentos separados no Firestore.

### Compatibilidade

Não é necessário recriar o banco nem reenviar as 60 questões/espelhos. As regras atuais de `users/{uid}/**` já permitem ao próprio usuário gravar as respostas em `attempts`.
