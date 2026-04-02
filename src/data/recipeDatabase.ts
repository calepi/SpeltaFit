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
    name: 'Omelete de Claras com Espinafre',
    description: 'Uma opção leve e proteica para o café da manhã ou jantar.',
    ingredients: ['3 claras de ovo', '1 ovo inteiro', '1 xícara de espinafre fresco', 'Sal e pimenta a gosto', '1 colher de chá de azeite'],
    instructions: [
      'Bata as claras e o ovo inteiro em uma tigela.',
      'Aqueça o azeite em uma frigideira antiaderente.',
      'Refogue o espinafre até murchar.',
      'Despeje os ovos batidos sobre o espinafre.',
      'Cozinhe em fogo baixo até dourar dos dois lados.'
    ],
    prepTime: '10 min',
    calories: 180,
    protein: 22,
    carbs: 3,
    fats: 9,
    category: 'cafe_da_manha'
  },
  {
    id: 'r_2',
    name: 'Frango com Cúrcuma e Limão',
    description: 'Frango suculento com propriedades anti-inflamatórias.',
    ingredients: ['150g de peito de frango em cubos', 'Suco de 1/2 limão', '1 colher de chá de cúrcuma', 'Pimenta preta a gosto', '1 colher de chá de azeite'],
    instructions: [
      'Tempere o frango com limão, cúrcuma e pimenta preta.',
      'Deixe marinar por 5 minutos.',
      'Aqueça o azeite em uma frigideira.',
      'Grelhe o frango até ficar dourado e cozido por dentro.'
    ],
    prepTime: '15 min',
    calories: 250,
    protein: 45,
    carbs: 2,
    fats: 6,
    category: 'almoco_jantar'
  },
  {
    id: 'r_3',
    name: 'Mingau de Aveia Proteico',
    description: 'Perfeito para o pré-treino ou café da manhã energético.',
    ingredients: ['40g de aveia em flocos', '1 scoop de Whey Protein', '200ml de água ou leite desnatado', 'Canela a gosto'],
    instructions: [
      'Cozinhe a aveia com a água/leite em fogo baixo até engrossar.',
      'Desligue o fogo e espere esfriar um pouco.',
      'Misture o Whey Protein vigorosamente até ficar homogêneo.',
      'Polvilhe canela por cima.'
    ],
    prepTime: '8 min',
    calories: 310,
    protein: 32,
    carbs: 35,
    fats: 5,
    category: 'pre_pos_treino'
  },
  {
    id: 'r_4',
    name: 'Abacate com Gotas de Limão e Mel',
    description: 'Lanche rápido rico em gorduras boas.',
    ingredients: ['1/2 abacate pequeno', 'Suco de 1/4 de limão', '1 colher de chá de mel (opcional)'],
    instructions: [
      'Corte o abacate ao meio e retire o caroço.',
      'Esprema o limão por cima.',
      'Adicione o mel se desejar um toque doce.'
    ],
    prepTime: '3 min',
    calories: 160,
    protein: 2,
    carbs: 12,
    fats: 14,
    category: 'lanche'
  }
];
