# Caderno OAB — Sprint 2.1 Firebase

Frontend estático para GitHub Pages + backend Firebase.

## O que foi adicionado

- Firebase Authentication com e-mail e senha.
- Cloud Firestore para sincronização do progresso.
- `localStorage` mantido como cache/offline imediato.
- Migração e mesclagem de progresso local e remoto ao entrar.
- Indicador visual de sincronização.
- `firestore.rules` com isolamento por usuário.

## Arquitetura

```text
GitHub Pages
  index.html / styles.css / app.js
        |
        +-- Firebase Authentication
        |
        +-- Cloud Firestore
              users/{uid}/state/progress
```

As 60 questões continuam em `data/questoes.json`. Isso é intencional nesta etapa. No próximo passo podemos migrar o banco oficial de questões/espelhos para uma coleção Firestore administrada separadamente.

## Configuração no Firebase Console

1. Crie um projeto no Firebase.
2. Adicione um aplicativo Web.
3. Copie o objeto `firebaseConfig` exibido pelo Firebase.
4. Cole os valores em `firebase-config.js`.
5. Em **Authentication > Sign-in method**, ative **Email/Password**.
6. Em **Firestore Database**, crie o banco.
7. Em **Firestore > Rules**, publique o conteúdo de `firestore.rules`.
8. Publique os arquivos no GitHub Pages.

## Teste local

Use um servidor HTTP local (Live Server, `python -m http.server`, etc.). Não abra apenas por `file://`, pois o projeto usa módulos JavaScript e `fetch()`.

## Segurança

A configuração web do Firebase não é uma senha. O controle de acesso é feito por Authentication e Firestore Security Rules. Não use regras abertas em produção.

## Próxima etapa sugerida

- coleção `questions` com questões oficiais;
- coleção/estrutura de espelhos FGV;
- perfis e papel de administrador;
- App Check;
- posteriormente Cloud Storage para fotos das respostas manuscritas.
