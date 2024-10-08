# Machine Efficiency Tracker

## Descrição

O **Machine Efficiency Tracker** é um aplicativo desenvolvido em React Native que permite aos usuários monitorar a eficiência de suas máquinas com base na temperatura ambiente. A aplicação está disponível para web, iOS e Android e oferece uma visão clara da eficiência da máquina através de uma interface amigável.

## Funcionalidades

- **Visualização da Temperatura e Eficiência:** A página inicial exibe a temperatura atual e a eficiência da máquina.
- **Gráfico de Linha:** Um gráfico de linha mostra o histórico de temperatura e eficiência ao longo do tempo.
- **Atualização Automática:** A página é atualizada automaticamente a cada 30 segundos.
- **Registro de Dados:** As informações (Data e Hora, Temperatura, Eficiência) são registradas em um banco de dados SQL a cada carregamento da página.
- **Exportação de Dados:** Possibilidade de exportar os dados de temperatura e eficiência para um arquivo Excel.
- **Sistema de Notificação:** Notificações são enviadas quando a temperatura ou eficiência atinge um nível crítico.

## Cálculo de Eficiência

A eficiência da máquina é calculada com base na temperatura ambiente:
- **Temperatura ≥ 28°C:** Eficiência de 100%.
- **Temperatura ≤ 24°C:** Eficiência de 75%.
- **Temperatura entre 24°C e 28°C:** A eficiência varia linearmente entre 75% e 100%.

## Requisitos

- **Página Inicial:** Deve estar disponível e mostrar informações atualizadas.
- **Atualização da Página:** A página deve atualizar a cada 30 segundos.
- **Banco de Dados:** Informações devem ser registradas em um banco de dados SQL externo, como PostgreSQL.
- **API REST:** Consulta das informações de temperatura via API REST (recomendado: OpenWeather).

## Banco de Dados

As tabelas utilizadas são:

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(5, 2) NOT NULL,
    efficiency DECIMAL(5, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
);

CREATE INDEX idx_sent_at ON notifications (sent_at);

CREATE TABLE temperature_efficiency_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(5, 2) NOT NULL,
    efficiency DECIMAL(5, 2) NOT NULL
);

CREATE INDEX idx_timestamp ON temperature_efficiency_log (timestamp);
```

## Tecnologias Utilizadas

- **React Native:** Para desenvolvimento do aplicativo para web, iOS e Android.
- **Expo:** Facilita o desenvolvimento e testes.
- **Axios:** Para chamadas HTTP à API de temperatura.
- **Chart.js:** Para exibição do gráfico de linha.
- **FileSystem e Sharing:** Para exportação dos dados em formato Excel e compartilhamento.

## Instalação

Para configurar o projeto localmente:

1. Clone o repositório:
    ```bash
    git clone https://github.com/larissabiancarochaa/MachineEfficiencyTracker.git
    ```

2. Navegue até o diretório do projeto:
    ```bash
    cd MachineEfficiencyTracker
    ```

3. Instale as dependências:
    ```bash
    npm install
    ```

4. Inicie o projeto:
    ```bash
    npx expo start
    ```

## Melhorias Futuras

Se mais tempo fosse disponível, melhorias potenciais poderiam incluir:

- Integração com mais fontes de dados de temperatura.
- Análise mais detalhada das tendências de eficiência.
- Notificações personalizadas baseadas em diferentes critérios.

**Machine Efficiency Tracker** - Desenvolvido com React Native para monitoramento e análise de eficiência de máquinas.