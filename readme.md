# LuminaCare - Sistema de Gestão para Profissionais de Saúde

LuminaCare é uma plataforma SaaS completa para profissionais de saúde gerenciarem agendamentos e prontuários eletrônicos de pacientes.

## Funcionalidades Principais

### 1. Sistema de Autenticação e Autorização
- Registro e login de usuários
- Autenticação JWT
- Perfis: Admin, Profissional de Saúde, Recepcionista
- Gerenciamento de times/clínicas

### 2. Dashboard Administrativo
- Visão geral dos agendamentos
- Métricas de desempenho
- Gestão de usuários
- Configurações da conta

### 3. Gerenciamento de Agenda
- Calendário interativo
- Definição de horários disponíveis
- Configuração de duração das consultas
- Bloqueio de horários específicos

### 4. Sistema de Agendamentos
- Visualização de consultas agendadas
- Confirmação, remarcação e cancelamento
- Notificações automáticas
- Histórico de agendamentos

### 5. Prontuário Eletrônico do Paciente (PEP)
- Registro completo de histórico médico
- Histórico de consultas e tratamentos
- Upload e armazenamento de documentos e exames
- Evolução clínica com anotações por consulta
- Prescrições médicas e medicamentos
- Gestão de alergias e condições crônicas
- Registro de sinais vitais e métricas de saúde
- Controle de acesso baseado em funções

## Stack Tecnológica

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **PostgreSQL**: Banco de dados relacional
- **Prisma ORM**: ORM para PostgreSQL
- **JWT**: Autenticação
- **Socket.io**: Comunicação em tempo real

### Frontend
- **React**: Biblioteca de UI
- **React Router**: Navegação
- **React Query**: Gerenciamento de dados e cache
- **Tailwind CSS**: Framework CSS
- **Headless UI**: Componentes acessíveis
- **Chart.js**: Visualização de dados

### DevOps
- **Docker**: Containerização
- **GitHub Actions**: CI/CD
- **Railway/Vercel**: Hospedagem

## Estrutura do Projeto

```
luminacare/
├── client/                  # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.js
├── server/                  # Backend Node.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── package.json
└── README.md
```

## Módulo de Prontuário Eletrônico

O módulo de Prontuário Eletrônico do Paciente (PEP) é uma das principais funcionalidades do LuminaCare, permitindo o registro completo e seguro de informações médicas dos pacientes.

### Características do Prontuário Eletrônico

1. **Registro Completo de Consultas**
   - Queixa principal
   - História clínica
   - Exame físico
   - Diagnósticos (CID opcional)
   - Tratamentos e prescrições
   - Evolução clínica

2. **Registro de Sinais Vitais**
   - Temperatura
   - Pressão arterial
   - Frequência cardíaca
   - Frequência respiratória
   - Saturação de oxigênio
   - Peso e altura (com cálculo automático de IMC)
   - Escala de dor

3. **Prescrições Médicas**
   - Medicamentos
   - Dosagens
   - Frequência
   - Duração
   - Instruções especiais

4. **Evolução Clínica**
   - Registro cronológico de evoluções
   - Acompanhamento do tratamento
   - Notas de progresso

5. **Anexos e Documentos**
   - Upload de exames
   - Imagens médicas
   - Documentos relevantes

6. **Segurança e Privacidade**
   - Controle de acesso baseado em funções
   - Registro de auditoria
   - Conformidade com normas de privacidade

### Fluxo de Trabalho do Prontuário

1. **Criação de Prontuário**
   - A partir de um agendamento
   - Diretamente na ficha do paciente
   - Como novo registro

2. **Preenchimento de Informações**
   - Interface intuitiva para registro de dados
   - Campos estruturados para facilitar o preenchimento
   - Suporte a texto livre para observações

3. **Assinatura e Finalização**
   - Assinatura digital do profissional
   - Registro de data e hora
   - Bloqueio de edição após assinatura (exceto por administradores)

4. **Consulta e Impressão**
   - Visualização completa do histórico
   - Impressão formatada para documentação física
   - Exportação para PDF

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Docker e Docker Compose (opcional)

### Configuração do Backend

1. Instalar dependências
   ```bash
   cd server
   npm install
   ```

2. Configurar variáveis de ambiente
   ```bash
   cp .env.example .env
   # Editar .env com as configurações do banco de dados
   ```

3. Executar migrações do Prisma
   ```bash
   npx prisma migrate dev
   ```

4. Executar seed para dados iniciais
   ```bash
   npx prisma db seed
   ```

5. Iniciar o servidor
   ```bash
   npm run dev
   ```

### Configuração do Frontend

1. Instalar dependências
   ```bash
   cd client
   npm install
   ```

2. Configurar variáveis de ambiente
   ```bash
   cp .env.example .env
   # Editar .env com a URL da API
   ```

3. Iniciar o cliente
   ```bash
   npm start
   ```

## Credenciais de Demonstração

- **Administrador**
  - Email: admin@luminacare.com
  - Senha: senha123

- **Profissional**
  - Email: carlos@luminacare.com
  - Senha: senha123

- **Recepcionista**
  - Email: maria@luminacare.com
  - Senha: senha123

## Licença

Este projeto está licenciado sob a licença MIT.

---

Desenvolvido com ❤️ pela Equipe LuminaCare