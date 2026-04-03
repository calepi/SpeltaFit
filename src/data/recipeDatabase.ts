export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: 'cafe_da_manha' | 'almoco_jantar' | 'lanche' | 'pre_pos_treino';
  image?: string;
}

export const RECIPE_DB: Recipe[] = [
  {
    id: 'r_1',
    name: 'Omelete Simples com Queijo Minas',
    description: 'Clássico, rápido e com ingredientes que você tem na geladeira.',
    ingredients: ['2 ovos inteiros', '1 fatia grossa de queijo minas frescal picado', '1 pitada de sal', '1 fio de azeite ou manteiga para untar', 'Orégano a gosto'],
    instructions: [
      'Bata os ovos em um prato fundo com um garfo.',
      'Adicione o sal, o orégano e o queijo minas picado.',
      'Aqueça a frigideira untada em fogo médio.',
      'Despeje a mistura e deixe dourar de um lado, depois vire com cuidado para dourar o outro.'
    ],
    prepTime: '5 min',
    calories: 220,
    protein: 18,
    carbs: 2,
    fats: 15,
    category: 'cafe_da_manha'
  },
  {
    id: 'r_2',
    name: 'Crepioca de Frango',
    description: 'Substitui o pão, dá muita saciedade e usa frango desfiado que sobrou do almoço.',
    ingredients: ['1 ovo inteiro', '2 colheres de sopa de goma de tapioca', '1 pitada de sal', '3 colheres de sopa de frango desfiado temperado'],
    instructions: [
      'Em uma tigela, bata o ovo com a tapioca e o sal até formar uma massa homogênea.',
      'Despeje em uma frigideira antiaderente pré-aquecida.',
      'Quando a massa soltar do fundo, vire.',
      'Coloque o frango desfiado em uma das metades, dobre a crepioca e deixe mais 1 minuto para aquecer o recheio.'
    ],
    prepTime: '10 min',
    calories: 250,
    protein: 20,
    carbs: 25,
    fats: 7,
    category: 'cafe_da_manha'
  },
  {
    id: 'r_3',
    name: 'Frango Acebolado Rápido',
    description: 'O básico que funciona. Peito de frango suculento com cebola.',
    ingredients: ['150g de peito de frango em tiras', '1/2 cebola cortada em rodelas', '1 dente de alho amassado', 'Sal e pimenta do reino a gosto', '1 colher de chá de azeite'],
    instructions: [
      'Tempere o frango com alho, sal e pimenta.',
      'Aqueça o azeite na frigideira e coloque o frango.',
      'Deixe dourar bem de um lado antes de mexer.',
      'Quando o frango estiver quase pronto, adicione a cebola e refogue até ela ficar transparente e douradinha.'
    ],
    prepTime: '15 min',
    calories: 210,
    protein: 35,
    carbs: 5,
    fats: 5,
    category: 'almoco_jantar'
  },
  {
    id: 'r_4',
    name: 'Carne Moída com Legumes',
    description: 'Rende muito, é barato e você pode congelar para a semana.',
    ingredients: ['150g de carne moída (patinho ou acém magro)', '1/2 cenoura picada em cubinhos', '1/2 abobrinha picada', '1/4 de cebola picada', '1 dente de alho', 'Sal e temperos secos a gosto'],
    instructions: [
      'Refogue a cebola e o alho em uma panela.',
      'Adicione a carne moída e mexa até perder a cor avermelhada.',
      'Tempere com sal e seus temperos favoritos.',
      'Adicione a cenoura e um pouquinho de água, tampe e deixe cozinhar por 5 minutos.',
      'Adicione a abobrinha e cozinhe por mais 3 minutos até os legumes ficarem macios.'
    ],
    prepTime: '20 min',
    calories: 280,
    protein: 32,
    carbs: 10,
    fats: 12,
    category: 'almoco_jantar'
  },
  {
    id: 'r_5',
    name: 'Mingau de Aveia com Banana',
    description: 'Clássico pré-treino brasileiro, barato e dá muita energia.',
    ingredients: ['3 colheres de sopa de aveia em flocos', '1 xícara de leite (integral ou desnatado)', '1 banana prata amassada', 'Canela em pó a gosto'],
    instructions: [
      'Em uma panela, misture a aveia e o leite.',
      'Leve ao fogo baixo, mexendo sempre até engrossar.',
      'Desligue o fogo, misture a banana amassada.',
      'Sirva em um prato fundo e polvilhe canela por cima.'
    ],
    prepTime: '10 min',
    calories: 290,
    protein: 10,
    carbs: 50,
    fats: 5,
    category: 'pre_pos_treino'
  },
  {
    id: 'r_6',
    name: 'Vitamina de Mamão e Maçã',
    description: 'Lanche rápido, refrescante e ajuda muito no intestino.',
    ingredients: ['1 fatia média de mamão', '1/2 maçã com casca', '200ml de leite gelado', '1 colher de sopa de aveia'],
    instructions: [
      'Corte as frutas em pedaços menores.',
      'Coloque todos os ingredientes no liquidificador.',
      'Bata por 1 minuto até ficar bem cremoso.',
      'Beba em seguida.'
    ],
    prepTime: '5 min',
    calories: 210,
    protein: 8,
    carbs: 35,
    fats: 4,
    category: 'lanche'
  },
  {
    id: 'r_7',
    name: 'Sanduíche de Atum Simples',
    description: 'Lanche da tarde proteico e muito prático para levar para o trabalho.',
    ingredients: ['2 fatias de pão de forma (preferência integral)', '3 colheres de sopa de atum ralado (em água)', '1 colher de sopa de requeijão light ou creme de ricota', 'Folhas de alface'],
    instructions: [
      'Escorra bem a água do atum.',
      'Em um potinho, misture o atum com o requeijão até formar um patê.',
      'Passe o patê nas fatias de pão.',
      'Adicione a alface, feche o sanduíche e pronto.'
    ],
    prepTime: '5 min',
    calories: 240,
    protein: 18,
    carbs: 25,
    fats: 7,
    category: 'lanche'
  },
  {
    id: 'r_8',
    name: 'Macarrão com Atum e Tomate',
    description: 'Refeição salva-vidas para quando não tem carne descongelada.',
    ingredients: ['80g de macarrão (peso cru)', '1/2 lata de atum em água', '2 tomates picados', '1/2 cebola picada', '1 dente de alho', 'Sal e manjericão a gosto'],
    instructions: [
      'Cozinhe o macarrão conforme as instruções da embalagem.',
      'Em uma panela, refogue a cebola e o alho.',
      'Adicione os tomates picados e deixe cozinhar até desmanchar um pouco (formando um molho rústico).',
      'Adicione o atum escorrido, tempere com sal.',
      'Misture o molho no macarrão cozido e finalize com manjericão.'
    ],
    prepTime: '15 min',
    calories: 380,
    protein: 25,
    carbs: 60,
    fats: 4,
    category: 'almoco_jantar'
  }
];
