# Caderno OAB — Banco Oficial 32º ao 46º + Firebase

Frontend estático para GitHub Pages conectado ao projeto Firebase `oabcaderno`.

## Conteúdo desta versão

- 60 questões discursivas oficiais de Direito do Trabalho, do 32º ao 46º Exame de Ordem (15 exames × 4 questões).
- 60 espelhos/gabaritos oficiais correspondentes.
- Enunciados em `data/questoes.json`.
- Espelhos em `data/espelhos.json`.
- Firebase Authentication + sincronização de progresso do estudante.
- Firestore como fonte principal das questões, com fallback local para `questoes.json`.
- Script administrativo para popular as coleções `questions` e `mirrors`.

## Estrutura no Firestore

```text
questions/{questionId}
mirrors/{questionId}
users/{uid}/state/progress
```

IDs são estáveis, por exemplo:

```text
trabalho-32-q1
trabalho-32-q2
...
trabalho-46-q4
```

## 1. Publicar as Security Rules

No Firebase Console, abra **Firestore Database > Rules** e publique o conteúdo de `firestore.rules`.

- `questions`: leitura pública e escrita bloqueada para clientes Web.
- `mirrors`: leitura somente para usuários autenticados e escrita bloqueada para clientes Web.
- `users/{uid}`: cada estudante acessa apenas os próprios dados.

As escritas administrativas de `questions` e `mirrors` são feitas pelo Firebase Admin SDK, que não depende dessas regras de cliente.

## 2. Gerar uma chave administrativa

No Firebase Console:

1. **Configurações do projeto**.
2. **Contas de serviço**.
3. **Firebase Admin SDK**.
4. **Gerar nova chave privada**.
5. Salve o arquivo como `serviceAccountKey.json` na raiz deste projeto.

**Nunca envie esse arquivo para o GitHub.** Ele já está incluído no `.gitignore`.

## 3. Enviar as 60 questões e 60 espelhos ao Firestore

Com Node.js instalado:

```bash
npm install
npm run seed:dry
npm run seed
```

O comando real faz `upsert` usando IDs determinísticos, portanto pode ser executado novamente sem criar duplicatas.

Depois, confira no Firebase Console:

```text
questions   60 documentos
mirrors     60 documentos
```

## 4. Publicar o frontend no GitHub Pages

Envie para o repositório os arquivos do frontend, incluindo `data/questoes.json` como fallback, mas **não** envie:

```text
serviceAccountKey.json
node_modules/
```

Ao abrir o site, a aplicação tenta carregar `questions` do Firestore. Se o banco remoto estiver indisponível, usa automaticamente `data/questoes.json`.

## Fontes dos dados

Os registros foram extraídos das duas coletâneas fornecidas para o projeto:

- `OAB_Trabalho_I_a_46_Enunciados.pdf`
- `OAB_Trabalho_I_a_46_Gabaritos_Oficiais.pdf`

O recorte desta versão é exclusivamente do **32º ao 46º Exame de Ordem**, sem incluir peças prático-profissionais.

**Nota histórica:** os enunciados e espelhos foram preservados conforme a legislação e a jurisprudência consideradas na época de cada exame. O banco não reescreve questões antigas para o direito vigente.
