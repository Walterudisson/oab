# Caderno OAB — Sprint 2.1 + Firebase

Frontend estático para GitHub Pages com Firebase Authentication e Cloud Firestore.

## Projeto Firebase conectado

- Project ID: `oabcaderno`
- Auth domain: `oabcaderno.firebaseapp.com`
- Configuração Web: `firebase-config.js`

O projeto usa o Firebase JS SDK modular via CDN oficial, portanto não precisa de npm, Vite ou outro bundler para rodar no GitHub Pages.

## O que já funciona

- Banco de 60 questões de demonstração.
- Busca e filtros por status.
- Tela de resolução.
- Marcar como resolvida e para revisão.
- Autoavaliação.
- `localStorage` como cache local.
- Cadastro com e-mail e senha.
- Login/logout.
- Sincronização do progresso no Firestore.
- Mesclagem entre progresso local e remoto.

## Ativação no Firebase Console

### 1. Authentication

Abra **Firebase Console > Authentication > Sign-in method** e habilite **Email/Password**.

### 2. Firestore

Abra **Firestore Database** e crie o banco de dados.

Depois publique as regras presentes em `firestore.rules`.

Os dados de cada estudante ficam em:

```text
users/{uid}/state/progress
```

As regras impedem que um usuário autenticado leia ou altere os dados de outro usuário.

### 3. Domínio do GitHub Pages

Em **Authentication > Settings > Authorized domains**, adicione o domínio usado pelo site publicado, por exemplo:

```text
seuusuario.github.io
```

Use somente o hostname, sem `https://` e sem caminho do repositório.

Se testar em `localhost`, projetos Firebase recentes podem exigir que `localhost` também seja incluído manualmente na lista de domínios autorizados.

## Publicação no GitHub Pages

Copie todo o conteúdo desta pasta para a raiz do repositório:

```text
index.html
styles.css
app.js
firebase-config.js
firebase-service.js
firestore.rules
data/
assets/
```

O `index.html` carrega `app.js` como ES module e todos os caminhos são relativos, portanto a aplicação funciona também em URLs do tipo:

```text
https://usuario.github.io/caderno-oab/
```

## Teste mínimo

1. Publique os arquivos.
2. Abra o site.
3. Clique em **Entrar**.
4. Crie uma conta com e-mail e senha.
5. Resolva ou marque uma questão para revisão.
6. No Firebase Console, abra **Firestore > Data**.
7. Confirme a criação de:

```text
users
  └── <UID DO USUÁRIO>
      └── state
          └── progress
```

## Próxima etapa

Migrar o banco estático de questões para coleções Firestore, mantendo o progresso individual separado do conteúdo oficial.
