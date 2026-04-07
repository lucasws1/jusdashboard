USE jusdashboard;
-- ============================================================
-- CLIENTES
-- ============================================================
INSERT INTO clientes (
    nome,
    cpf_cnpj,
    email,
    telefone,
    endereco,
    observacoes
  )
VALUES (
    'Maria Aparecida Souza',
    '432.876.091-55',
    'maria.souza@gmail.com',
    '(51) 99812-3344',
    'Rua Borges de Medeiros, 520, Porto Alegre - RS',
    'Cliente desde 2021. Prefere contato por WhatsApp.'
  ),
  (
    'João Carlos Ferreira',
    '871.234.560-12',
    'joao.ferreira@hotmail.com',
    '(51) 98744-7890',
    'Av. Ipiranga, 1200, Porto Alegre - RS',
    NULL
  ),
  (
    'Construtora Pinheiro Ltda.',
    '14.823.091/0001-77',
    'juridico@pinheiro.com.br',
    '(51) 3322-4455',
    'Rua dos Andradas, 887, Porto Alegre - RS',
    'Empresa de médio porte. Contato: Dr. Renato Pinheiro.'
  ),
  (
    'Fernanda Lima',
    '598.340.217-88',
    'fernanda.lima@yahoo.com.br',
    '(51) 99601-2233',
    'Rua Felipe Camarão, 74, Canoas - RS',
    'Atendida inicialmente por defensoria. Encaminhada.'
  ),
  (
    'Roberto Augusto Meirelles',
    '723.119.084-30',
    'roberto.meirelles@gmail.com',
    '(51) 99355-6677',
    'Av. Assis Brasil, 3100, Porto Alegre - RS',
    NULL
  ),
  (
    'Transportes Sul Gaúcho S.A.',
    '07.654.321/0001-90',
    'adm@tsg.com.br',
    '(51) 3211-8800',
    'Rodovia BR-116, km 12, Gravataí - RS',
    'Frota de 80 veículos. Múltiplos processos trabalhistas.'
  );
-- ============================================================
-- PROCESSOS
-- ============================================================
INSERT INTO processos (
    cliente_id,
    numero_processo,
    titulo,
    area,
    tipo,
    vara_tribunal,
    status,
    observacoes
  )
VALUES -- Maria Aparecida
  (
    1,
    '5012345-88.2023.8.21.0001',
    'Ação de Divórcio Litigioso',
    'família',
    'ação ordinária',
    '3ª Vara de Família - TJRS',
    'ativo',
    'Partilha de imóvel em discussão.'
  ),
  (
    1,
    '5098712-33.2024.8.21.0001',
    'Inventário do Espólio de José Souza',
    'família',
    'inventário',
    '2ª Vara de Sucessões - TJRS',
    'ativo',
    'Três herdeiros. Bem principal: apartamento em Petrópolis.'
  ),
  -- João Carlos
  (
    2,
    '0001234-55.2022.5.04.0731',
    'Reclamatória Trabalhista - Horas Extras',
    'trabalhista',
    'reclamatória',
    '1ª Vara do Trabalho de Porto Alegre',
    'ativo',
    'Período: 2018–2022. Valor estimado R$ 45.000.'
  ),
  (
    2,
    '0009988-11.2023.5.04.0731',
    'Ação de Indenização por Dano Moral',
    'cível',
    'ação ordinária',
    '12ª Vara Cível - TJRS',
    'suspenso',
    'Aguardando perícia psicológica.'
  ),
  -- Construtora Pinheiro
  (
    3,
    '5034512-77.2021.8.21.0001',
    'Ação de Cobrança - Contrato de Obra',
    'cível',
    'ação de cobrança',
    '8ª Vara Cível - TJRS',
    'ativo',
    'Devedor: Condomínio Jardins do Sul.'
  ),
  (
    3,
    '5034513-62.2022.8.21.0001',
    'Embargos de Terceiro',
    'cível',
    'embargos',
    '8ª Vara Cível - TJRS',
    'arquivado',
    'Resolvido por acordo extrajudicial em mar/2023.'
  ),
  -- Fernanda Lima
  (
    4,
    '0007654-21.2024.5.04.0851',
    'Reclamatória Trabalhista - Verbas Rescisórias',
    'trabalhista',
    'reclamatória',
    '5ª Vara do Trabalho de Canoas',
    'ativo',
    'Dispensa sem justa causa. Sem pagamento de aviso prévio.'
  ),
  -- Roberto Meirelles
  (
    5,
    '5001122-44.2020.8.21.0001',
    'Ação Revisional de Contrato Bancário',
    'cível',
    'ação revisional',
    '15ª Vara Cível - TJRS',
    'encerrado',
    'Sentença favorável transitada em julgado em jan/2024.'
  ),
  (
    5,
    '5001123-29.2023.8.21.0001',
    'Execução de Título Extrajudicial',
    'cível',
    'execução',
    '15ª Vara Cível - TJRS',
    'ativo',
    'Penhora de veículo deferida. Aguardando leilão.'
  ),
  -- Transportes Sul Gaúcho
  (
    6,
    '0002211-88.2022.5.04.0661',
    'Reclamatória - Motorista Fábio Carvalho',
    'trabalhista',
    'reclamatória',
    '3ª Vara do Trabalho de Gravataí',
    'ativo',
    'Alegação de jornada excessiva e falta de DSR.'
  ),
  (
    6,
    '0002212-73.2022.5.04.0661',
    'Reclamatória - Motorista Gilson Ramos',
    'trabalhista',
    'reclamatória',
    '3ª Vara do Trabalho de Gravataí',
    'ativo',
    'Mesmo pedido. Tramita em paralelo.'
  ),
  (
    6,
    '0002213-58.2023.5.04.0661',
    'Ação de Indenização - Acidente de Trânsito',
    'cível',
    'ação ordinária',
    '2ª Vara Cível de Gravataí',
    'suspenso',
    'Aguardando laudo pericial do DETRAN.'
  );
-- ============================================================
-- ANDAMENTOS
-- ============================================================
INSERT INTO andamentos (processo_id, data_andamento, descricao, tipo)
VALUES -- Processo 1: Divórcio Maria
  (
    1,
    '2023-03-10',
    'Petição inicial protocolada. Juntada de certidão de casamento e documentos patrimoniais.',
    'petição'
  ),
  (
    1,
    '2023-04-22',
    'Despacho do juiz determinando citação do réu por oficial de justiça.',
    'despacho'
  ),
  (
    1,
    '2023-06-15',
    'Réu citado. Prazo de contestação iniciado.',
    'despacho'
  ),
  (
    1,
    '2023-07-20',
    'Contestação apresentada pelo réu. Requer partilha igualitária do imóvel.',
    'petição'
  ),
  (
    1,
    '2024-02-08',
    'Audiência de mediação realizada. Partes não chegaram a acordo.',
    'audiência'
  ),
  (
    1,
    '2024-05-30',
    'Laudo de avaliação do imóvel juntado aos autos. Valor: R$ 380.000.',
    'despacho'
  ),
  -- Processo 2: Inventário Maria
  (
    2,
    '2024-01-15',
    'Petição inicial de inventário protocolada. Nomeação de inventariante.',
    'petição'
  ),
  (
    2,
    '2024-02-20',
    'Primeiras declarações apresentadas. Relação de bens e herdeiros.',
    'petição'
  ),
  (
    2,
    '2024-04-10',
    'Despacho do juiz solicitando avaliação do imóvel.',
    'despacho'
  ),
  -- Processo 3: Trabalhista João
  (
    3,
    '2022-05-03',
    'Reclamatória protocolada. Pedido de horas extras, FGTS e danos morais.',
    'petição'
  ),
  (
    3,
    '2022-06-18',
    'Notificação da empresa reclamada. Audiência inaugural designada.',
    'despacho'
  ),
  (
    3,
    '2022-09-14',
    'Audiência inaugural realizada. Reclamada apresentou defesa e documentos.',
    'audiência'
  ),
  (
    3,
    '2022-09-14',
    'Juiz determinou realização de perícia contábil para apuração das horas.',
    'despacho'
  ),
  (
    3,
    '2023-01-20',
    'Laudo pericial juntado. Perito apurou crédito de R$ 38.240,00.',
    'despacho'
  ),
  (
    3,
    '2023-06-05',
    'Audiência de instrução. Oitiva de testemunhas das duas partes.',
    'audiência'
  ),
  (
    3,
    '2024-03-11',
    'Memoriais finais apresentados pela parte autora.',
    'petição'
  ),
  -- Processo 5: Cobrança Pinheiro
  (
    5,
    '2021-08-02',
    'Ação de cobrança protocolada. Valor da causa: R$ 220.000.',
    'petição'
  ),
  (
    5,
    '2021-09-15',
    'Citação do réu realizada.',
    'despacho'
  ),
  (
    5,
    '2021-10-30',
    'Contestação apresentada. Réu alega vício na obra como causa do não pagamento.',
    'petição'
  ),
  (
    5,
    '2022-03-22',
    'Audiência de conciliação. Acordo não celebrado.',
    'audiência'
  ),
  (
    5,
    '2022-09-10',
    'Laudo pericial de engenharia juntado. Sem indício de vício construtivo.',
    'despacho'
  ),
  (
    5,
    '2023-04-18',
    'Sentença proferida. Condenação do réu ao pagamento integral.',
    'sentença'
  ),
  (
    5,
    '2023-04-18',
    'Prazo recursal iniciado.',
    'despacho'
  ),
  -- Processo 7: Trabalhista Fernanda
  (
    7,
    '2024-02-01',
    'Reclamatória protocolada. Pedidos: aviso prévio, 13º, férias+1/3, FGTS+40%.',
    'petição'
  ),
  (
    7,
    '2024-03-12',
    'Notificação da empresa. Audiência inaugural designada para maio.',
    'despacho'
  ),
  (
    7,
    '2024-05-22',
    'Audiência inaugural. Reclamada alega justa causa não documentada. Processo prossegue.',
    'audiência'
  ),
  -- Processo 9: Execução Roberto
  (
    9,
    '2023-05-10',
    'Petição de execução protocolada com base em contrato particular.',
    'petição'
  ),
  (
    9,
    '2023-06-20',
    'Despacho deferindo a execução e determinando citação do executado.',
    'despacho'
  ),
  (
    9,
    '2023-09-04',
    'Executado não pagou no prazo. Requerida penhora de veículo.',
    'petição'
  ),
  (
    9,
    '2023-10-18',
    'Penhora de veículo (Fiat Strada 2020) deferida e registrada no DETRAN.',
    'despacho'
  ),
  (
    9,
    '2024-01-30',
    'Prazo para pagamento antes do leilão fixado em 30 dias.',
    'despacho'
  ),
  -- Processo 10: Trabalhista TSG - Fábio
  (
    10,
    '2022-07-11',
    'Reclamatória protocolada. Período trabalhado: 2017–2022.',
    'petição'
  ),
  (
    10,
    '2022-08-25',
    'Audiência inaugural. Empresa apresentou cartões ponto.',
    'audiência'
  ),
  (
    10,
    '2022-08-25',
    'Juiz designou perícia para análise dos controles de jornada.',
    'despacho'
  ),
  (
    10,
    '2023-02-14',
    'Laudo pericial: diferenças de horas extras apuradas em R$ 28.500.',
    'despacho'
  ),
  -- Processo 11: Trabalhista TSG - Gilson
  (
    11,
    '2022-07-13',
    'Reclamatória protocolada. Pedidos idênticos ao processo do colega Fábio.',
    'petição'
  ),
  (
    11,
    '2022-09-01',
    'Audiência inaugural. Empresa apresentou defesa.',
    'audiência'
  ),
  (
    11,
    '2023-03-20',
    'Perícia juntada. Diferenças de R$ 31.200 apuradas.',
    'despacho'
  );
-- ============================================================
-- PRAZOS
-- ============================================================
INSERT INTO prazos (
    processo_id,
    descricao,
    data_prazo,
    status,
    observacoes
  )
VALUES -- Processo 1: Divórcio Maria
  (
    1,
    'Apresentar contrarrazões ao recurso do réu',
    '2026-04-18',
    'pendente',
    'Réu recorreu da decisão sobre partilha. Prazo fatal.'
  ),
  (
    1,
    'Recolher custas de avaliação do imóvel',
    '2026-04-10',
    'concluido',
    'Guia paga em 08/04.'
  ),
  -- Processo 2: Inventário
  (
    2,
    'Apresentar avaliação do imóvel ao juízo',
    '2026-05-15',
    'pendente',
    'Aguardando laudo do avaliador judicial.'
  ),
  -- Processo 3: Trabalhista João
  (
    3,
    'Apresentar memoriais finais (empresa)',
    '2026-04-25',
    'pendente',
    'Prazo comum. Protocolar antes das 23h59.'
  ),
  (
    3,
    'Verificar publicação de sentença',
    '2026-05-10',
    'pendente',
    'Monitorar DJe a partir desta data.'
  ),
  -- Processo 5: Cobrança Pinheiro
  (
    5,
    'Prazo recursal - Apelação do réu',
    '2023-05-18',
    'concluido',
    'Réu não recorreu. Processo transitou.'
  ),
  (
    5,
    'Iniciar cumprimento de sentença',
    '2026-06-01',
    'pendente',
    'Aguardar trânsito em julgado formal.'
  ),
  -- Processo 7: Trabalhista Fernanda
  (
    7,
    'Audiência de instrução',
    '2026-05-28',
    'pendente',
    'Preparar rol de testemunhas até 5 dias antes.'
  ),
  (
    7,
    'Protocolar rol de testemunhas',
    '2026-05-23',
    'pendente',
    'Prazo: 5 dias antes da audiência de instrução.'
  ),
  -- Processo 9: Execução Roberto
  (
    9,
    'Acompanhar designação de data do leilão',
    '2026-04-30',
    'pendente',
    'Verificar publicação no DJe.'
  ),
  (
    9,
    'Comunicar cliente sobre leilão',
    '2026-04-22',
    'pendente',
    'Ligar para Roberto assim que data for publicada.'
  ),
  -- Processo 10: TSG - Fábio
  (
    10,
    'Apresentar contrarrazões ao recurso ordinário',
    '2026-04-28',
    'pendente',
    'TSG recorreu do laudo. Prazo de 8 dias úteis.'
  ),
  -- Processo 11: TSG - Gilson
  (
    11,
    'Audiência de instrução e julgamento',
    '2026-05-14',
    'pendente',
    'Confirmar presença de preposto da empresa.'
  ),
  (
    11,
    'Intimar testemunha - Sr. Paulo Henrique',
    '2026-04-20',
    'pendente',
    'Testemunha não tem advogado. Precisa de intimação judicial.'
  );