import { Isa95Level, MesaFunction, ProductionLine, WorkOrder, BatchTraceabilityRecord } from '../types/mes';

export const ISA95_LEVELS: Isa95Level[] = [
  {
    level: 4,
    acronym: 'ERP / SCM / CRM',
    name: 'Nível Corporativo & Planejamento de Negócios',
    timeHorizon: 'Meses a Dias',
    primaryRole: 'Gestão comercial, financeira, compras, custos e planejamento macro (MRP II). Define "O QUE" e "QUANTO" produzir.',
    examples: ['SAP S/4HANA', 'TOTVS Protheus', 'Oracle NetSuite', 'Microsoft Dynamics'],
    protocols: ['REST API', 'OData', 'SOAP / XML', 'EDIFACT / IDoc'],
    mesInteraction: 'O ERP envia as Ordens de Produção (OPs) e a lista de materiais (BOM). O MES devolve o apontamento de produção real, consumo efetivo de matéria-prima e custos de refugo.',
    keyData: 'Ordens de venda, estoques financeiros, cadastro de produtos, previsões de demanda.'
  },
  {
    level: 3,
    acronym: 'MES / MOM',
    name: 'Nível de Execução da Manufatura (MOM - Mfg Ops Mgmt)',
    timeHorizon: 'Dias, Turnos, Horas a Minutos',
    primaryRole: 'O coração da fábrica: gerencia a execução das ordens em tempo real, calcula OEE, garante rastreabilidade total, instruções de trabalho e qualidade.',
    examples: ['Siemens Opcenter', 'Rockwell FactoryTalk ProductionCentre', 'Dassault DELMIA', 'IndusMES'],
    protocols: ['OPC-UA', 'MQTT', 'WebSockets', 'REST', 'AMQP'],
    mesInteraction: 'Foco Central: Orquestra o chão de fábrica, conecta o mundo de TI (ERP) ao mundo de TA (Automação), transformando bits de sensores em decisões operacionais.',
    keyData: 'Ordens ativas, OEE (Disponibilidade, Performance, Qualidade), genealogia de lote, motivos de parada, instruções técnicas.'
  },
  {
    level: 2,
    acronym: 'SCADA / IHM',
    name: 'Nível de Supervisão e Controle de Processo',
    timeHorizon: 'Minutos a Segundos',
    primaryRole: 'Telas sinóticas operadas pelos operadores e engenheiros para visualizar o estado de tanques, esteiras, temperaturas e alarmes.',
    examples: ['Wonderware InTouch', 'Siemens WinCC', 'Inductive Automation Ignition', 'GE iFIX'],
    protocols: ['OPC DA / UA', 'Modbus TCP', 'EtherNet/IP', 'PROFINET'],
    mesInteraction: 'O SCADA envia leituras de variáveis de processo e alarmes de falha para o MES registrar paradas e vincular parâmetros às peças produzidas.',
    keyData: 'Setpoints, alarmes ativos, gráficos de temperatura/vazão, status de acionamentos.'
  },
  {
    level: 1,
    acronym: 'CLP / PLC / CNC / Robôs',
    name: 'Nível de Controle Lógico e Automação Direta',
    timeHorizon: 'Sub-segundos (Milissegundos)',
    primaryRole: 'Execução de lógica de controle em malha fechada (PID, intertravamentos de segurança, sequenciamento de eixos).',
    examples: ['Siemens S7-1500', 'Rockwell ControlLogix', 'Schneider Modicon', 'KUKA / ABB Robot'],
    protocols: ['Fieldbus', 'EtherCAT', 'PROFINET', 'DeviceNet', 'IO-Link'],
    mesInteraction: 'O MES lê contadores de pulsos (peças feitas, peças rejeitadas) e estados de sensores diretamente ou via gateway industrial.',
    keyData: 'Sinais digitais/analógicos, pulsos de encoder, paradas de emergência, saídas de relé.'
  },
  {
    level: 0,
    acronym: 'Sensores & Atuadores',
    name: 'Processo Físico de Produção',
    timeHorizon: 'Tempo Real Contínuo (Física)',
    primaryRole: 'A transformação física da matéria: usinagem, injeção plástica, soldagem, aquecimento, corte e empacotamento.',
    examples: ['Células de carga', 'Termopares Pt100', 'Barreiras fotoelétricas', 'Válvulas proporcionais', 'Servomotores'],
    protocols: ['4-20mA', '0-10V', 'PNP/NPN 24Vdc', 'HART'],
    mesInteraction: 'Gera os sinais físicos que o CLP digitaliza e o MES contextualiza em métricas de produtividade.',
    keyData: 'Tensão, corrente, força, vazão, torque, posição linear/angular.'
  }
];

export const MESA_11_FUNCTIONS: MesaFunction[] = [
  {
    id: 1,
    title: 'Alocação e Status de Recursos',
    titleEn: 'Resource Allocation and Status',
    category: 'execucao',
    shortDesc: 'Monitora e gerencia a disponibilidade e estado de máquinas, ferramentas e operadores.',
    detailedExplanation: 'Garante que os equipamentos, ferramental de precisão e operadores qualificados estejam disponíveis antes de iniciar uma ordem de produção, evitando desperdício de tempo e setup inadequado.',
    shopFloorApplication: 'Indicação em tempo real de quais tornos CNC estão calibrados, quais moldes estão prontos e qual técnico certificado está operando cada máquina.',
    benefit: 'Redução drástica do tempo de setup e eliminação do uso de ferramentas descalibradas ou desgastadas.'
  },
  {
    id: 2,
    title: 'Despacho e Sequenciamento de OPs',
    titleEn: 'Dispatching Production Units',
    category: 'planejamento',
    shortDesc: 'Distribui as Ordens de Produção na fábrica respeitando prioridades, prazos e gargalos.',
    detailedExplanation: 'Recebe as ordens de produção macro do ERP e faz o sequenciamento fino (Finite Capacity Scheduling), definindo exatamente qual máquina fará cada lote, minuto a minuto.',
    shopFloorApplication: 'Reordenar dinamicamente a fila de produção quando uma máquina quebra, priorizando a entrega crítica para o cliente sem interromper toda a fábrica.',
    benefit: 'Aumento do cumprimento do prazo de entrega (On-Time Delivery) e minimização de filas de espera (WIP).'
  },
  {
    id: 3,
    title: 'Coleta e Aquisição de Dados em Tempo Real',
    titleEn: 'Data Collection & Acquisition',
    category: 'execucao',
    shortDesc: 'Coleta automática e manual de tempos, contagens de peças, sensores e paradas.',
    detailedExplanation: 'Substitui as pranchetas de papel por integração com CLPs e tablets no chão de fábrica. Cada batida de prensa ou sensor de barreira é registrado no segundo em que acontece.',
    shopFloorApplication: 'Sensores ópticos na esteira contam peças boas e refugadas; quando a linha para por mais de 60 segundos, o tablet solicita ao operador o motivo da parada.',
    benefit: 'Fim dos apontamentos manuais falsos no fim do turno ("efeito prancheta") e visibilidade instantânea.'
  },
  {
    id: 4,
    title: 'Gestão da Qualidade & SPC/CEP',
    titleEn: 'Quality Management',
    category: 'qualidade',
    shortDesc: 'Inspeções em processo, controle estatístico de processo e contenção de lotes defeituosos.',
    detailedExplanation: 'Registra medições dimensionais, peso, torque e ensaios destrutivos. Alerta automaticamente se uma cota estiver saindo da tolerância (CPK) antes de gerar peças refugadas.',
    shopFloorApplication: 'A cada 30 minutos, o operador insere medições com paquímetro digital Bluetooth; se houver tendência de desvio, o MES bloqueia o lote e aciona a engenharia.',
    benefit: 'Prevenção de recalls milionários e redução de sucata através do controle preventivo de tolerâncias.'
  },
  {
    id: 5,
    title: 'Gestão de Processos & Roteamento',
    titleEn: 'Process Management',
    category: 'execucao',
    shortDesc: 'Garante que cada produto siga rigorosamente o roteiro operacional especificado.',
    detailedExplanation: 'Impede que uma peça vá para a etapa de pintura antes de passar pela etapa de desengraxe e inspeção de solda. Valida a rota técnica do produto no sistema.',
    shopFloorApplication: 'Ao bipar o código de barras da peça na estação de montagem final, o sistema recusa a operação caso o teste de estanqueidade anterior não tenha sido aprovado.',
    benefit: 'Garantia total de conformidade normativa e eliminação de erros humanos no fluxo operacional.'
  },
  {
    id: 6,
    title: 'Rastreabilidade e Genealogia de Produto',
    titleEn: 'Product Tracking and Genealogy',
    category: 'qualidade',
    shortDesc: 'Histórico completo de "quem, quando, onde e com o quê" cada unidade foi fabricada.',
    detailedExplanation: 'Cria o "prontuário digital" de cada peça ou lote: quais matérias-primas foram consumidas, lote do fornecedor, máquina utilizada, curvas de temperatura e operador responsável.',
    shopFloorApplication: 'Em indústrias automotivas ou farmacêuticas, se uma matéria-prima apresentar defeito meses depois, o MES identifica em segundos todos os números de chassi afetados.',
    benefit: 'Conformidade com FDA 21 CFR Part 11, IATF 16949 e realização de recalls cirúrgicos (restritos a 1 lote).'
  },
  {
    id: 7,
    title: 'Análise de Performance e Cálculo de OEE',
    titleEn: 'Performance Analysis & OEE',
    category: 'analise',
    shortDesc: 'Cálculo contínuo do OEE (Disponibilidade × Performance × Qualidade) e perdas.',
    detailedExplanation: 'Compara os resultados reais com os parâmetros teóricos de engenharia. Destrincha as 6 grandes perdas de equipamentos (quebras, setup, pequenas paradas, velocidade lenta, refugo).',
    shopFloorApplication: 'Painéis Andon nas linhas exibindo OEE atual de 82,4% em verde ou 64% em vermelho, mostrando que o gargalo do turno foi a perda de velocidade.',
    benefit: 'Identificação cirúrgica dos gargalos e embasamento para programas de melhoria contínua (Kaizen, Lean).'
  },
  {
    id: 8,
    title: 'Gestão da Manutenção Integrada',
    titleEn: 'Maintenance Management',
    category: 'execucao',
    shortDesc: 'Dispara ordens de manutenção com base em ciclos reais e horas de máquina rodadas.',
    detailedExplanation: 'Em vez de fazer manutenção preventiva por calendário fixo ("a cada 30 dias"), o MES dispara ordens com base em horas de operação reais ou contagem de ciclos de injeção.',
    shopFloorApplication: 'Após 100.000 golpes da prensa, o MES avisa a equipe de manutenção que a matriz precisa de retífica preventiva e agenda o intervalo de troca.',
    benefit: 'Redução de paradas catastróficas imprevistas e economia em peças de reposição trocadas antes da hora.'
  },
  {
    id: 9,
    title: 'Controle de Documentos e Instruções Digitais',
    titleEn: 'Document Control',
    category: 'planejamento',
    shortDesc: 'Apresenta na tela do operador a versão vigente e correta do procedimento padrão (POP).',
    detailedExplanation: 'Garante que os operadores sempre acessem desenhos técnicos, instruções de montagem (SOP) e fichas de segurança (FISPQ) atualizadas, eliminando impressões em papel desatualizadas.',
    shopFloorApplication: 'Quando a ordem de produção é chamada no terminal da estação, o monitor exibe automaticamente o desenho 3D e o torque exigido para aquele modelo específico.',
    benefit: 'Fim dos erros causados por desenhos técnicos obsoletos e facilidade de auditoria ISO 9001.'
  },
  {
    id: 10,
    title: 'Gestão de Mão de Obra e Treinamentos',
    titleEn: 'Labor Management',
    category: 'execucao',
    shortDesc: 'Controla presença, apontamento de horas homem (HH) e matriz de competência.',
    detailedExplanation: 'Monitora a produtividade de cada operador, tempo de preparação e valida se o operador tem a certificação/treinamento de segurança necessário para operar aquela máquina.',
    shopFloorApplication: 'Um operador tenta fazer login numa prensa de 500 toneladas; o sistema bloqueia porque o treinamento de segurança NR-12 dele venceu há 3 dias.',
    benefit: 'Segurança jurídica, redução de acidentes de trabalho e precisão no custo de mão de obra direta (MOD).'
  },
  {
    id: 11,
    title: 'Gestão de Materiais e WIP (Work in Process)',
    titleEn: 'Product Tracking & Material Management',
    category: 'planejamento',
    shortDesc: 'Controle de estoques intermediários, almoxarifado de linha e consumo Kanban.',
    detailedExplanation: 'Registra o consumo de matéria-prima no momento exato do uso (baixa por explosão ou leitura de código de barras), mantendo o saldo de estoque intermediário perfeitamente atualizado.',
    shopFloorApplication: 'O sistema dispara um chamado automático para o carrinho AGV reabastecer as bobinas de alumínio da estação 3 antes que a linha fique desabastecida.',
    benefit: 'Redução drástica do capital parado em estoques intermediários e eliminação de paradas por falta de insumos.'
  }
];

export const INITIAL_PRODUCTION_LINES: ProductionLine[] = [
  {
    id: 'linha-01',
    name: 'Linha 01 · Envase e Embalagem Farmacêutica',
    industry: 'Farmacêutica & Cosméticos',
    description: 'Linha automatizada de envase asséptico, rotulagem de alta precisão e embalagem secundária com serialização.',
    targetHourlyRate: 1200,
    activeWorkOrderNumber: 'OP-2026-F088',
    stations: [
      {
        id: 'st-01',
        name: 'Lavagem & Esterilização',
        code: 'EST-101',
        lineId: 'linha-01',
        status: 'running',
        idealCycleTimeSec: 2.8,
        currentCycleTimeSec: 3.0,
        temperatureC: 121.5,
        pressureBar: 2.3,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 420,
        downtimeMin: 60,
        totalUnitsProduced: 8400,
        goodUnits: 8350,
        scrapUnits: 50,
        lastMaintenanceDate: '2026-10-15'
      },
      {
        id: 'st-02',
        name: 'Envase Asséptico & Fechamento',
        code: 'ENV-102',
        lineId: 'linha-01',
        status: 'running',
        idealCycleTimeSec: 3.0,
        currentCycleTimeSec: 3.1,
        temperatureC: 18.2,
        pressureBar: 1.1,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 410,
        downtimeMin: 70,
        totalUnitsProduced: 8200,
        goodUnits: 8120,
        scrapUnits: 80,
        lastMaintenanceDate: '2026-10-18'
      },
      {
        id: 'st-03',
        name: 'Inspeção por Visão Computacional',
        code: 'VIS-103',
        lineId: 'linha-01',
        status: 'running',
        idealCycleTimeSec: 2.5,
        currentCycleTimeSec: 2.5,
        temperatureC: 22.0,
        pressureBar: 0.0,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 435,
        downtimeMin: 45,
        totalUnitsProduced: 8120,
        goodUnits: 8055,
        scrapUnits: 65,
        lastMaintenanceDate: '2026-10-10'
      },
      {
        id: 'st-04',
        name: 'Rotulagem & Serialização Datamatrix',
        code: 'ROT-104',
        lineId: 'linha-01',
        status: 'idle',
        stopReason: 'Aguardando lote de rótulos',
        idealCycleTimeSec: 3.0,
        currentCycleTimeSec: 0.0,
        temperatureC: 24.1,
        pressureBar: 6.0,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 390,
        downtimeMin: 90,
        totalUnitsProduced: 7800,
        goodUnits: 7750,
        scrapUnits: 50,
        lastMaintenanceDate: '2026-10-19'
      }
    ]
  },
  {
    id: 'linha-02',
    name: 'Linha 02 · Usinagem e Estamparia Automotiva',
    industry: 'Autopeças & Metalmecânica',
    description: 'Célula de manufatura robotizada para usinagem de eixos de transmissão de alta precisão.',
    targetHourlyRate: 180,
    activeWorkOrderNumber: 'OP-2026-A104',
    stations: [
      {
        id: 'st-21',
        name: 'Torno CNC 5 Eixos',
        code: 'CNC-201',
        lineId: 'linha-02',
        status: 'running',
        idealCycleTimeSec: 20.0,
        currentCycleTimeSec: 21.2,
        temperatureC: 62.4,
        pressureBar: 45.0,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 430,
        downtimeMin: 50,
        totalUnitsProduced: 1215,
        goodUnits: 1195,
        scrapUnits: 20,
        lastMaintenanceDate: '2026-10-12'
      },
      {
        id: 'st-22',
        name: 'Centro de Fresamento & Furação',
        code: 'FRS-202',
        lineId: 'linha-02',
        status: 'stopped',
        stopReason: 'Desgaste prematuro de broca de metal duro',
        idealCycleTimeSec: 18.0,
        currentCycleTimeSec: 0.0,
        temperatureC: 78.1,
        pressureBar: 40.0,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 340,
        downtimeMin: 140,
        totalUnitsProduced: 960,
        goodUnits: 935,
        scrapUnits: 25,
        lastMaintenanceDate: '2026-10-08'
      },
      {
        id: 'st-23',
        name: 'Tratamento Térmico por Indução',
        code: 'IND-203',
        lineId: 'linha-02',
        status: 'running',
        idealCycleTimeSec: 15.0,
        currentCycleTimeSec: 15.1,
        temperatureC: 845.0,
        pressureBar: 5.5,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 440,
        downtimeMin: 40,
        totalUnitsProduced: 930,
        goodUnits: 924,
        scrapUnits: 6,
        lastMaintenanceDate: '2026-10-14'
      }
    ]
  },
  {
    id: 'linha-03',
    name: 'Linha 03 · Montagem de Placas SMT (Eletrônica)',
    industry: 'Eletrônica & IoT',
    description: 'Linha de montagem superficial de circuitos impressos de altíssima velocidade para módulos automotivos.',
    targetHourlyRate: 2400,
    activeWorkOrderNumber: 'OP-2026-E441',
    stations: [
      {
        id: 'st-31',
        name: 'Screen Printer de Pasta de Solda',
        code: 'PRT-301',
        lineId: 'linha-03',
        status: 'running',
        idealCycleTimeSec: 1.5,
        currentCycleTimeSec: 1.5,
        temperatureC: 23.0,
        pressureBar: 6.2,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 450,
        downtimeMin: 30,
        totalUnitsProduced: 17800,
        goodUnits: 17760,
        scrapUnits: 40,
        lastMaintenanceDate: '2026-10-20'
      },
      {
        id: 'st-32',
        name: 'Insersora Pick and Place SMD',
        code: 'SMD-302',
        lineId: 'linha-03',
        status: 'running',
        idealCycleTimeSec: 1.4,
        currentCycleTimeSec: 1.45,
        temperatureC: 28.5,
        pressureBar: 5.8,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 445,
        downtimeMin: 35,
        totalUnitsProduced: 17500,
        goodUnits: 17450,
        scrapUnits: 50,
        lastMaintenanceDate: '2026-10-17'
      },
      {
        id: 'st-33',
        name: 'Forno de Refusão 10 Zonas',
        code: 'REF-303',
        lineId: 'linha-03',
        status: 'maintenance',
        stopReason: 'Calibração do perfil de temperatura das zonas 4 e 5',
        idealCycleTimeSec: 1.5,
        currentCycleTimeSec: 0.0,
        temperatureC: 245.0,
        pressureBar: 1.0,
        totalPlannedTimeMin: 480,
        operatingTimeMin: 380,
        downtimeMin: 100,
        totalUnitsProduced: 14900,
        goodUnits: 14810,
        scrapUnits: 90,
        lastMaintenanceDate: '2026-10-21'
      }
    ]
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001',
    orderNumber: 'OP-2026-F088',
    productName: 'Solução Oral Pediátrica 100ml',
    productSku: 'MED-ORAL-100P',
    lineId: 'linha-01',
    plannedQuantity: 10000,
    producedQuantity: 7750,
    scrapQuantity: 195,
    status: 'in_progress',
    operatorName: 'Carlos Mendonça (Matrícula 4092)',
    batchNumber: 'LOTE-FARMA-2026-088',
    startTime: '06:00',
    targetEndTime: '14:30',
    defectLog: [
      { reason: 'Tampa desalinhada no rosqueamento', quantity: 82, timestamp: '08:45' },
      { reason: 'Volume de dosagem fora da especificação', quantity: 63, timestamp: '10:12' },
      { reason: 'Código Datamatrix ilegível na câmera', quantity: 50, timestamp: '11:30' }
    ]
  },
  {
    id: 'wo-002',
    orderNumber: 'OP-2026-A104',
    productName: 'Eixo de Transmissão Forjado 38CrMoAl',
    productSku: 'AUTO-AXLE-38CR',
    lineId: 'linha-02',
    plannedQuantity: 1500,
    producedQuantity: 924,
    scrapQuantity: 51,
    status: 'in_progress',
    operatorName: 'Mariana Vasconcelos (Matrícula 2185)',
    batchNumber: 'LOTE-AUTO-ENG-104',
    startTime: '07:00',
    targetEndTime: '16:00',
    defectLog: [
      { reason: 'Desvio dimensional no diâmetro do colo', quantity: 26, timestamp: '09:15' },
      { reason: 'Rugosidade superficial Ra > 0.8um', quantity: 18, timestamp: '11:05' },
      { reason: 'Trinca após têmpera por indução', quantity: 7, timestamp: '12:40' }
    ]
  },
  {
    id: 'wo-003',
    orderNumber: 'OP-2026-E441',
    productName: 'Módulo de Controle Eletrônico ECU-v4',
    productSku: 'ECU-PCB-V441',
    lineId: 'linha-03',
    plannedQuantity: 20000,
    producedQuantity: 14810,
    scrapQuantity: 180,
    status: 'paused',
    operatorName: 'Renato Takahashi (Matrícula 5831)',
    batchNumber: 'LOTE-SMT-2026-441',
    startTime: '05:30',
    targetEndTime: '13:30',
    defectLog: [
      { reason: 'Curto-circuito por excesso de pasta (ponte de solda)', quantity: 94, timestamp: '07:20' },
      { reason: 'Componente 0402 desalinhado no Pick&Place', quantity: 58, timestamp: '09:40' },
      { reason: 'Tombstoning em capacitor cerâmico', quantity: 28, timestamp: '11:15' }
    ]
  },
  {
    id: 'wo-004',
    orderNumber: 'OP-2026-F089',
    productName: 'Pomada Dermatológica 30g Bisnaga Alumínio',
    productSku: 'MED-DERM-30G',
    lineId: 'linha-01',
    plannedQuantity: 12000,
    producedQuantity: 0,
    scrapQuantity: 0,
    status: 'pending',
    operatorName: 'Aguardando Liberação de Turno',
    batchNumber: 'LOTE-FARMA-2026-089',
    startTime: '14:30',
    targetEndTime: '22:30',
    defectLog: []
  }
];

export const MOCK_TRACEABILITY_RECORD: BatchTraceabilityRecord = {
  batchNumber: 'LOTE-FARMA-2026-088',
  productName: 'Solução Oral Pediátrica 100ml (Frasco PET Âmbar)',
  manufactureDate: '2026-10-21 06:00',
  expiryDate: '2028-10-21',
  operator: 'Carlos Mendonça / Dra. Juliana Paes (Garantia de Qualidade)',
  productionLine: 'Linha 01 · Envase e Embalagem Farmacêutica',
  status: 'released',
  rawMaterials: [
    { name: 'Princípio Ativo Grau USP (Pureza 99.8%)', lotNumber: 'API-PAR-9921', supplier: 'PharmaCore Labs Ltd', quantity: '125.0 kg' },
    { name: 'Veículo Hidrossolúvel Edulcorado', lotNumber: 'VEI-ED-3301', supplier: 'BioChemicals Brasil', quantity: '875.0 L' },
    { name: 'Frascos PET 100ml Âmbar Farmacêutico', lotNumber: 'PKG-PET-8812', supplier: 'PlasTech Embalagens', quantity: '10.200 un' },
    { name: 'Tampas com Lacre Inviolável e Batoque', lotNumber: 'CAP-LAC-4410', supplier: 'LacreSafe Indústria', quantity: '10.200 un' }
  ],
  processParameters: [
    { parameter: 'Temperatura de Esterilização', target: '121.0 °C ± 1.0', measured: '121.5 °C', status: 'conform' },
    { parameter: 'Vazão de Dosagem Volumétrica', target: '100.0 ml ± 0.5', measured: '100.2 ml', status: 'conform' },
    { parameter: 'Torque de Rosqueamento da Tampa', target: '2.2 N·m ± 0.2', measured: '2.25 N·m', status: 'conform' },
    { parameter: 'Pressão Positiva na Sala Limpa ISO 5', target: '15 Pa ± 2', measured: '15.8 Pa', status: 'conform' }
  ],
  qualityTests: [
    { testName: 'Teor do Princípio Ativo (HPLC)', specification: '98.0% - 102.0%', result: '100.4%', approved: true },
    { testName: 'Uniformidade de Conteúdo Médio', specification: '99.5 ml - 100.5 ml', result: '100.1 ml', approved: true },
    { testName: 'Ensaio de Estanqueidade a Vácuo', specification: 'Zero vazamento a -0.4 bar', result: '100% estanque', approved: true },
    { testName: 'Leitura de Serialização Datamatrix', specification: 'Taxa de leitura > 99.8%', result: '99.92%', approved: true }
  ]
};
