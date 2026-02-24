# SEPOffice – Manual do Usuário

**Versão 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Instalação e Inicialização](#2-instalação-e-inicialização)
3. [Painel](#3-painel)
4. [SEPWrite – Processamento de Texto](#4-sepwrite--processamento-de-texto)
5. [SEPGrid – Planilha](#5-sepgrid--planilha)
6. [SEPShow – Apresentações](#6-sepshow--apresentações)
7. [Eliot – Assistente de IA](#7-eliot--assistente-de-ia)
8. [Configurações](#8-configurações)
9. [Atalhos de Teclado](#9-atalhos-de-teclado)

---

## 1. Visão Geral

SEPOffice é um pacote de escritório desktop com IA para Windows, composto por três aplicativos integrados:

| App | Função |
|-----|--------|
| **SEPWrite** | Criar documentos rich-text, exportar para Word/PDF |
| **SEPGrid** | Planilha com fórmulas e gráficos |
| **SEPShow** | Apresentações com editor canvas |

Todos os três apps estão conectados ao **Eliot** – um assistente de IA integrado que formula textos, gera fórmulas e projeta slides.

---

## 2. Instalação e Inicialização

### Instalador
Execute `SEPOffice Setup 1.0.1.exe`. O assistente guia você pela instalação:
- Diretório de instalação selecionável (padrão: `Arquivos de Programas\SEPOffice`)
- Entrada no menu Iniciar criada
- Atalho na área de trabalho opcional

### Início Direto (sem Instalador)
Execute `release\win-unpacked\SEPOffice.exe`.

### Primeira Inicialização
Na primeira inicialização, o serviço de IA carrega o modelo de linguagem (Qwen2.5-0.5B) em segundo plano. O progresso é visível no widget de chat Eliot no canto inferior direito. Dependendo do hardware, isso leva **1–5 minutos**.

> **Nota:** O app é imediatamente utilizável – Eliot ativa quando a barra de carregamento chega a 100%.

---

## 3. Painel

O Painel é a página inicial do SEPOffice.

### Três Blocos de App
- **SEPWrite** – Criar ou abrir documento
- **SEPGrid** – Criar ou abrir planilha
- **SEPShow** – Criar ou abrir apresentação

### Documentos Recentes
Abaixo dos blocos aparecem documentos editados recentemente com ícone de tipo, nome e data da última modificação.

### Navegação

| Elemento | Função |
|----------|--------|
| **SEPWrite / SEPGrid / SEPShow** | Alternar entre apps |
| ⚙️ | Abrir configurações |
| ⌨️ | Mostrar atalhos de teclado |
| 🌙 / ☀️ | Alternar modo escuro/claro |

---

## 4. SEPWrite – Processamento de Texto

SEPWrite é um editor rich-text moderno baseado em **TipTap**.

### 4.1 Formatação

| Símbolo | Função | Atalho |
|---------|--------|--------|
| **N** | Negrito | `Ctrl + B` |
| *I* | Itálico | `Ctrl + I` |
| <u>S</u> | Sublinhado | `Ctrl + U` |
| T1 | Título 1 | — |
| T2 | Título 2 | — |

### 4.2 Inserir Imagens
Via **Inserir → Imagem**: carregue via arrastar e soltar ou seleção de arquivo.

### 4.3 Salvar e Exportar

| Ação | Descrição |
|------|-----------|
| **Salvar** | Salvamento automático no armazenamento local do browser |
| **Exportar como .docx** | Baixar documento compatível com Word |
| **Imprimir / PDF** | Visualização de impressão, depois imprimir ou salvar como PDF |

---

## 5. SEPGrid – Planilha

SEPGrid é uma planilha poderosa com **10.000 linhas × 26 colunas** por folha de cálculo – comparável ao Microsoft Excel e OpenOffice Calc.

### 5.1 Operações Básicas

| Ação | Descrição |
|------|-----------|
| Clicar na célula | Selecionar célula |
| Duplo clique / F2 | Editar célula |
| `Enter` | Confirmar, mover para próxima linha |
| `Tab` | Confirmar, mover para próxima coluna |
| `Escape` | Cancelar edição |
| `Ctrl + Z` | Desfazer |
| `Ctrl + Y` | Refazer |
| `Ctrl + C` | Copiar |
| `Ctrl + V` | Colar |
| `Ctrl + X` | Recortar |
| `Ctrl + B` | Negrito |
| `Ctrl + I` | Itálico |
| `Ctrl + U` | Sublinhado |
| `Ctrl + F` | Localizar e Substituir |
| `Del` | Limpar conteúdo da célula |

**Seleção múltipla:** Arraste o mouse com o botão esquerdo pressionado ou `Shift + Clique`.

**Alça de preenchimento:** Arraste o quadrado azul no canto inferior direito de uma célula para copiar valores ou fórmulas.

### 5.2 A Barra de Fórmulas

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SOMA(A1:A10)                            │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Endereço   Símbolo        Campo de entrada (mostra fórmula bruta)
```

- **Endereço da célula**: Mostra a célula ativa ou intervalo selecionado (ex.: `A1:B5`)
- **Símbolo fx**: Indica entrada de fórmula
- **Campo de entrada**: Sempre mostra a fórmula bruta – não o resultado

**Exibição de erros:** Para erros como `#ERRO`, `#REF!`, `#DIV/0!` etc., o campo fica vermelho e o erro é mostrado à direita.

### 5.3 Inserir Fórmulas

A entrada de fórmula sempre começa com `=`:

```
=SOMA(A1:A10)            Soma
=MÉDIA(B1:B5)            Média
=MÁXIMO(C1:C100)         Máximo
=MÍNIMO(D1:D50)          Mínimo
=CONT.NÚM(A:A)           Contagem
=SE(A1>0,"Sim","Não")    Condição
=PROCV(...)              Procura vertical
=ARRED(A1, 2)            Arredondamento
```

#### Referências de Fórmula por Clique do Mouse

1. Digite `=` ou uma função como `=SOMA(`
2. Clique na célula desejada → Endereço é inserido
3. Arraste para intervalos → Intervalo é inserido (ex.: `A1:B10`)

Funciona após `=`, `(`, `+`, `-`, `*`, `/`, `,` e `!`.

### 5.4 Fórmulas entre Planilhas

Referências a outras planilhas – como no Excel:

```
=Plan2!A1                       Célula única de Plan2
=SOMA(Plan2!A1:B10)             Soma de Plan2
=Plan1!A1 + Plan2!B5            Combinação de várias planilhas
=MÉDIA(Vendas!C1:C100)          Intervalo da planilha "Vendas"
```

**Via clique do mouse:**
1. Digite `=` em uma célula
2. Clique em outra guia de planilha → `Plan2!` é inserido
3. Clique na célula desejada → `A1` é adicionado

### 5.5 Formatos de Número

Via símbolo **123** na barra de ferramentas:

| Formato | Exemplo | Descrição |
|---------|---------|-----------|
| Padrão | 1234.5 | Sem formatação |
| Número | 1.234,56 | Notação com 2 decimais |
| Moeda | R$ 1.234,56 | Formato de moeda |
| Porcentagem | 12,5% | Valor × 100 com símbolo % |
| Milhares | 1.234 | Números inteiros com separador de milhares |
| Data | 24/02/2026 | Formato de data |

### 5.6 Mesclar Células

1. Selecione o intervalo de células
2. **Inserir → Mesclar Células**
3. Apenas o valor da célula superior esquerda é mantido

**Desfazer mesclagem:** **Inserir → Desfazer Mesclagem**

### 5.7 Formatação Condicional

1. Selecionar intervalo
2. **Editar → Formatação Condicional...**
3. Escolher regra: Maior que / Menor que / Igual a / Entre / Texto contém
4. Escolher cores para texto e plano de fundo
5. **Adicionar**

**Remover:** Selecionar intervalo → **Editar → Remover Formatação Condicional**

### 5.8 Congelar Painéis

1. Selecione a célula a partir da qual o rolamento deve começar
2. **Exibir → Congelar Painéis**
3. Todas as linhas acima e colunas à esquerda são congeladas

**Descongelar:** **Exibir → Descongelar Painéis**

### 5.9 Comentários

1. Selecione célula → **Inserir → Adicionar Comentário** → Inserir texto → OK
2. Células com comentários mostram um **triângulo vermelho** no canto superior direito

### 5.10 Localizar e Substituir

`Ctrl + F` ou **Editar → Localizar e Substituir**:
- **Localizar**: Navegar com ◀ ▶
- **Substituir**: Individualmente ou todos de uma vez

### 5.11 Inserir/Excluir Linhas e Colunas

Via menu **Inserir**: Inserir linha acima/abaixo, coluna esquerda/direita, excluir linha/coluna.

### 5.12 Barra de Status

Na parte inferior, estatísticas são exibidas automaticamente para seleções múltiplas:

```
Σ Soma: 12.345   ⌀ Média: 1.234   ↓ Mín: 100   ↑ Máx: 5.000   Contagem: 10
```

### 5.13 Importar / Exportar

| Função | Formato | Descrição |
|--------|---------|-----------|
| Importar | `.xlsx`, `.xlsm` | Abrir arquivos Excel |
| Importar CSV | `.csv` | Arquivos separados por vírgula/ponto e vírgula |
| Exportar | `.xlsx` | Salvar como arquivo Excel |
| Exportar CSV | `.csv` | Salvar como CSV (UTF-8, ponto e vírgula) |
| Imprimir / PDF | — | Visualização de impressão, apenas linhas preenchidas |
| Inserir Imagem | PNG, JPG | Incorporar imagem na planilha |

### 5.14 Funções de IA

#### Gerador de Fórmulas IA
Clique em **✨** na barra de fórmulas:
> "Calcule a média de todos os valores positivos na coluna B"
> → `=MÉDIASE(B:B,">0")`

#### Assistente de Tabelas IA
> "Crie uma tabela de vendas mensais para 2025 com colunas: Mês, Receita, Custos, Lucro"

#### Escrita Vibe
Ative via **Arquivo → Ativar Escrita Vibe**: suporte de IA durante a digitação.

### 5.15 Resumo de Atalhos de Teclado

| Atalho | Função |
|--------|--------|
| `Ctrl + Z` | Desfazer |
| `Ctrl + Y` | Refazer |
| `Ctrl + C` | Copiar |
| `Ctrl + V` | Colar |
| `Ctrl + X` | Recortar |
| `Ctrl + B` | Negrito |
| `Ctrl + I` | Itálico |
| `Ctrl + U` | Sublinhado |
| `Ctrl + F` | Localizar e Substituir |
| `F2` | Editar célula |
| `Enter` | Confirmar + descer |
| `Tab` | Confirmar + ir para direita |
| `Escape` | Cancelar |
| `Del` | Limpar conteúdo |
| `Shift + Clique` | Estender seleção |

---

## 6. SEPShow – Apresentações

SEPShow é um editor de apresentações baseado em slides com **Konva** (renderizador canvas).

### 6.1 Interface

| Área | Descrição |
|------|-----------|
| **Barra lateral esquerda** | Lista de slides – prévia de todos os slides, reordenar via arrastar e soltar |
| **Área principal** | Editor canvas do slide ativo |
| **Barra de ferramentas** | Ferramentas, exportação, modo apresentação |
| **Notas do apresentador** | Notas para o slide atual |

### 6.2 Inserir Elementos

| Ação | Descrição |
|------|-----------|
| **Texto** | Colocar campo de texto no slide |
| **Imagem** | Inserir imagem via upload |
| **Forma** | Retângulos, círculos, etc. |
| **Layout IA** | IA gera layout completo para o slide |

### 6.3 Gerenciar Slides

| Ação | Descrição |
|------|-----------|
| **+** na barra lateral | Adicionar novo slide |
| Clique direito no slide | Duplicar, excluir, mover |
| Arrastar e soltar | Alterar ordem |

### 6.4 Modo Apresentação

Clique em **Apresentar** para apresentação em tela cheia:
- Navegação: teclas de seta `→` / `←` ou clique
- `Esc` sai do modo apresentação

---

## 7. Eliot – Assistente de IA

Eliot é o assistente de IA integrado disponível nos três apps.

### 7.1 O Widget de Chat

O **símbolo flutuante Eliot** fica no canto inferior direito em todos os apps.

#### Indicadores de Status

| Símbolo | Status |
|---------|--------|
| 💬 (normal) | IA pronta |
| ⏳ (girando) | IA carregando |
| ❌ (vermelho) | Erro ou não conectado |

### 7.2 Trabalhar com Eliot

**Exemplos de solicitações:**

*No SEPWrite:*
- "Escreva uma introdução profissional para um relatório sobre energias renováveis"

*No SEPGrid:*
- "Qual fórmula calcula a média móvel de 5 valores?"

---

## 8. Configurações

### Configurações de IA
| Opção | Descrição |
|-------|-----------|
| **URL da API** | URL do backend de IA (padrão: `http://localhost:8080`) |
| **Chave de API** | Opcional, para APIs de IA externas |
| **Testar Conexão** | Verifica se o serviço de IA está acessível |

### Idioma
SEPOffice suporta **29 idiomas**. O idioma pode ser selecionado na janela de configurações.

---

## 9. Atalhos de Teclado

### Global

| Atalho | Função |
|--------|--------|
| `Ctrl + Z` | Desfazer |
| `Ctrl + Y` | Refazer |
| `Ctrl + S` | Salvar |

### SEPGrid

| Atalho | Função |
|--------|--------|
| `Enter` | Confirmar célula, descer |
| `Tab` | Confirmar célula, ir para direita |
| `Escape` | Cancelar edição |
| `Ctrl + C` | Copiar |
| `Ctrl + V` | Colar |
| `F2` | Editar célula |
| Teclas de seta | Navegar células |

---

## Notas Técnicas

- **Armazenamento de dados:** Todos os documentos são salvos localmente no armazenamento do browser. Nenhum dado é transmitido a servidores externos.
- **Modelo de IA:** Qwen2.5-0.5B é executado completamente localmente – sem conexão à internet necessária.
- **Requisitos do sistema:** Windows 10/11, mín. 4 GB RAM (8 GB recomendado para o modelo de IA)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
