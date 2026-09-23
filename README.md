# ianoba-frontend

Sistema moderno de gerenciamento de licenças e keys de software, construído com Next.js 15, React 19 e TypeScript.

## 📋 Descrição

Sistema web completo para gerenciar licenças de software, permitindo criar, renovar, listar e gerenciar keys de usuários. Interface moderna e responsiva com suporte a tema claro/escuro.

## ✨ Funcionalidades

- 🔐 **Autenticação**: Sistema de login seguro com token JWT
- 🔑 **Gerenciamento de Keys**: Criar, listar, renovar e deletar keys
- 📊 **Dashboard**: Visualização completa de todas as keys cadastradas
- 🔍 **Filtros**: Busca por usuário e produto
- 📱 **Responsivo**: Interface otimizada para desktop e mobile
- 🌓 **Tema**: Suporte a tema claro e escuro
- 🔄 **Reset HWID**: Funcionalidade para resetar HWID de keys
- 📋 **Cópia Rápida**: Copiar keys e HWIDs com um clique

## 🛠️ Tecnologias

- **Framework**: Next.js 15.5.9 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Estilização**: Tailwind CSS 4.1.9
- **UI Components**: shadcn/ui (Radix UI)
- **Gerenciamento de Estado**: Zustand
- **Fontes**: Geist Sans & Geist Mono
- **Ícones**: Lucide React

## 📦 Pré-requisitos

- Node.js 20 ou superior
- npm (gerenciador padrão do projeto)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/selsofoda/ianoba-frontend.git
cd ianoba-frontend
```

2. Instale as dependências:
```bash
pnpm install
# ou
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
# Crie um arquivo .env.local na raiz do projeto
NEXT_PUBLIC_API_URL=https://ianobacloud.com/api
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=https://ianobacloud.com/api
```

**Nota**: Se não configurar, o sistema usará `https://ianobacloud.com/api` como URL padrão da API.

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor de desenvolvimento na porta 3000

# Build
pnpm build        # Cria build de produção

# Produção
pnpm start        # Inicia servidor de produção

# Lint
pnpm lint         # Executa o linter
```

## 📁 Estrutura do Projeto

```
ianoba-frontend/
├── app/                    # Páginas e rotas (App Router)
│   ├── create/            # Página de criação de keys
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de login
│   ├── renew-key/         # Página de renovação de keys
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial (redirecionamento)
├── components/            # Componentes React
│   ├── ui/                # Componentes UI (shadcn/ui)
│   ├── auth-guard.tsx     # Proteção de rotas
│   ├── alert-provider.tsx # Sistema de alertas
│   └── theme-provider.tsx # Gerenciamento de tema
├── hooks/                 # Custom hooks
│   └── use-alert.tsx      # Hook para alertas
├── lib/                   # Utilitários e configurações
│   ├── api.ts             # Cliente API
│   ├── auth-context.tsx   # Contexto de autenticação
│   └── utils.ts           # Funções utilitárias
├── public/                # Arquivos estáticos
└── styles/                # Estilos globais
```

## 🔌 API Endpoints

O sistema consome os seguintes endpoints da API:

- `POST /login` - Autenticação
- `GET /keys` - Listar keys (com filtros opcionais)
- `POST /create_key` - Criar nova key
- `POST /renew_key` - Renovar key existente
- `GET /reset_hwid` - Resetar HWID
- `DELETE /delete_key` - Deletar key

### Formato de Requisições

#### Login
```json
{
  "user": "usuario",
  "pass": "senha"
}
```

#### Criar Key
```json
{
  "username": "USUARIO",
  "days": 30,
  "product": "PRODUTO",
  "max_threads": 999
}
```

#### Renovar Key
```json
{
  "username": "USUARIO",
  "days": 30,
  "product": "PRODUTO"
}
```

## 🎨 Componentes Principais

### AuthGuard
Componente que protege rotas, redirecionando usuários não autenticados para a página de login.

### AlertProvider
Sistema de alertas global usando Zustand, com suporte a:
- Success
- Error
- Warning
- Info
- Confirm (com callbacks)

### ThemeProvider
Gerenciamento de tema claro/escuro com persistência no localStorage.

## 🔒 Autenticação

O sistema utiliza autenticação baseada em token JWT:
- Token armazenado no `localStorage`
- Token enviado no header `Authorization: Bearer <token>`
- Redirecionamento automático para login quando token expira ou é inválido

## 📱 Responsividade

O dashboard possui duas visualizações:
- **Desktop**: Tabela completa com todas as informações
- **Mobile**: Cards otimizados para telas pequenas

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure a variável de ambiente `NEXT_PUBLIC_API_URL` se necessário
3. O deploy será automático a cada push

### Build Manual

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se o token está sendo salvo no localStorage
- Confirme que a API está retornando o token corretamente

### Erro ao carregar keys
- Verifique a URL da API nas variáveis de ambiente
- Confirme que o token está sendo enviado no header Authorization

### Build errors
- Execute `pnpm install` para garantir que todas as dependências estão instaladas
- Verifique se há erros de TypeScript: `pnpm build`

## 📝 Licença

Este projeto é privado e proprietário.

## 👤 Autor

**selsofodaportela**
- GitHub: [@selsofoda](https://github.com/selsofoda)

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Radix UI](https://www.radix-ui.com/) - Componentes primitivos acessíveis
