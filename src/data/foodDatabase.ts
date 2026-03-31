export interface FoodItem {
  id: string;
  name: string;
  category: 'proteina' | 'carboidrato' | 'gordura' | 'vegetal' | 'fruta' | 'suplemento';
  calories: number; // por 100g ou unidade
  protein: number;
  carbs: number;
  fats: number;
  baseQuantity: string; // ex: "100g", "1 unidade"
}

export const FOOD_DB: FoodItem[] = [
  // PROTEÍNAS ANIMAIS
  { id: 'frango_grelhado', name: 'Frango Grelhado', category: 'proteina', calories: 165, protein: 31, carbs: 0, fats: 3.6, baseQuantity: '100g' },
  { id: 'frango_desfiado', name: 'Frango Desfiado', category: 'proteina', calories: 150, protein: 28, carbs: 0, fats: 3, baseQuantity: '100g' },
  { id: 'patinho_moido', name: 'Carne Moída (Patinho)', category: 'proteina', calories: 220, protein: 26, carbs: 0, fats: 12, baseQuantity: '100g' },
  { id: 'file_mignon', name: 'Filé Mignon Grelhado', category: 'proteina', calories: 250, protein: 28, carbs: 0, fats: 15, baseQuantity: '100g' },
  { id: 'ovo_cozido', name: 'Ovo Cozido', category: 'proteina', calories: 155, protein: 13, carbs: 1.1, fats: 11, baseQuantity: '100g' },
  { id: 'ovo_mexido', name: 'Ovo Mexido (sem óleo)', category: 'proteina', calories: 160, protein: 13, carbs: 1.5, fats: 12, baseQuantity: '100g' },
  { id: 'tilapia_grelhada', name: 'Tilápia Grelhada', category: 'proteina', calories: 128, protein: 26, carbs: 0, fats: 2.7, baseQuantity: '100g' },
  { id: 'salmao_grelhado', name: 'Salmão Grelhado', category: 'proteina', calories: 208, protein: 20, carbs: 0, fats: 13, baseQuantity: '100g' },
  { id: 'atum_lata', name: 'Atum em Lata (Natural)', category: 'proteina', calories: 116, protein: 26, carbs: 0, fats: 1, baseQuantity: '100g' },
  { id: 'lombo_suino', name: 'Lombo Suíno', category: 'proteina', calories: 240, protein: 27, carbs: 0, fats: 14, baseQuantity: '100g' },
  { id: 'peito_peru', name: 'Peito de Peru Defumado', category: 'proteina', calories: 104, protein: 17, carbs: 1, fats: 2, baseQuantity: '100g' },

  // PROTEÍNAS VEGETAIS / LATICÍNIOS
  { id: 'tofu', name: 'Tofu Grelhado', category: 'proteina', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, baseQuantity: '100g' },
  { id: 'tempeh', name: 'Tempeh', category: 'proteina', calories: 193, protein: 19, carbs: 9, fats: 11, baseQuantity: '100g' },
  { id: 'queijo_cottage', name: 'Queijo Cottage', category: 'proteina', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, baseQuantity: '100g' },
  { id: 'queijo_minas', name: 'Queijo Minas Frescal', category: 'proteina', calories: 240, protein: 17, carbs: 3, fats: 18, baseQuantity: '100g' },
  { id: 'iogurte_natural', name: 'Iogurte Natural Integral', category: 'proteina', calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3, baseQuantity: '100g' },
  { id: 'iogurte_grego_zero', name: 'Iogurte Grego Zero', category: 'proteina', calories: 55, protein: 7, carbs: 4, fats: 0, baseQuantity: '100g' },

  // CARBOIDRATOS COMPLEXOS
  { id: 'arroz_branco', name: 'Arroz Branco Cozido', category: 'carboidrato', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, baseQuantity: '100g' },
  { id: 'arroz_integral', name: 'Arroz Integral Cozido', category: 'carboidrato', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, baseQuantity: '100g' },
  { id: 'feijao_carioca', name: 'Feijão Carioca Cozido', category: 'carboidrato', calories: 76, protein: 4.8, carbs: 14, fats: 0.5, baseQuantity: '100g' },
  { id: 'feijao_preto', name: 'Feijão Preto Cozido', category: 'carboidrato', calories: 91, protein: 6, carbs: 16, fats: 0.5, baseQuantity: '100g' },
  { id: 'grao_de_bico', name: 'Grão de Bico Cozido', category: 'carboidrato', calories: 164, protein: 9, carbs: 27, fats: 2.6, baseQuantity: '100g' },
  { id: 'lentilha', name: 'Lentilha Cozida', category: 'carboidrato', calories: 116, protein: 9, carbs: 20, fats: 0.4, baseQuantity: '100g' },
  { id: 'batata_doce', name: 'Batata Doce Cozida', category: 'carboidrato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, baseQuantity: '100g' },
  { id: 'batata_inglesa', name: 'Batata Inglesa Cozida', category: 'carboidrato', calories: 77, protein: 2, carbs: 17, fats: 0.1, baseQuantity: '100g' },
  { id: 'mandioca', name: 'Mandioca Cozida', category: 'carboidrato', calories: 160, protein: 1.3, carbs: 38, fats: 0.3, baseQuantity: '100g' },
  { id: 'macarrao_integral', name: 'Macarrão Integral Cozido', category: 'carboidrato', calories: 124, protein: 5.3, carbs: 25, fats: 0.5, baseQuantity: '100g' },
  { id: 'aveia_flocos', name: 'Aveia em Flocos', category: 'carboidrato', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, baseQuantity: '100g' },
  { id: 'pao_integral', name: 'Pão Integral (Fatia)', category: 'carboidrato', calories: 65, protein: 3, carbs: 12, fats: 1, baseQuantity: '1 unidade' },
  { id: 'tapioca', name: 'Goma de Tapioca', category: 'carboidrato', calories: 240, protein: 0, carbs: 60, fats: 0, baseQuantity: '100g' },
  { id: 'cuscuz', name: 'Cuscuz de Milho', category: 'carboidrato', calories: 112, protein: 2.3, carbs: 25, fats: 0.2, baseQuantity: '100g' },
  { id: 'quinoa', name: 'Quinoa Cozida', category: 'carboidrato', calories: 120, protein: 4.4, carbs: 21, fats: 1.9, baseQuantity: '100g' },

  // GORDURAS BOAS
  { id: 'azeite_oliva', name: 'Azeite de Oliva Extra Virgem', category: 'gordura', calories: 884, protein: 0, carbs: 0, fats: 100, baseQuantity: '100g' },
  { id: 'abacate', name: 'Abacate', category: 'gordura', calories: 160, protein: 2, carbs: 8.5, fats: 15, baseQuantity: '100g' },
  { id: 'castanha_para', name: 'Castanha do Pará', category: 'gordura', calories: 656, protein: 14, carbs: 12, fats: 66, baseQuantity: '100g' },
  { id: 'amendoas', name: 'Amêndoas', category: 'gordura', calories: 579, protein: 21, carbs: 22, fats: 50, baseQuantity: '100g' },
  { id: 'pasta_amendoim', name: 'Pasta de Amendoim Integral', category: 'gordura', calories: 588, protein: 25, carbs: 20, fats: 50, baseQuantity: '100g' },
  { id: 'nozes', name: 'Nozes', category: 'gordura', calories: 654, protein: 15, carbs: 14, fats: 65, baseQuantity: '100g' },
  { id: 'semente_chia', name: 'Semente de Chia', category: 'gordura', calories: 486, protein: 17, carbs: 42, fats: 31, baseQuantity: '100g' },

  // FRUTAS
  { id: 'banana_prata', name: 'Banana Prata', category: 'fruta', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, baseQuantity: '100g' },
  { id: 'maca', name: 'Maçã com casca', category: 'fruta', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, baseQuantity: '100g' },
  { id: 'mamao_papaia', name: 'Mamão Papaia', category: 'fruta', calories: 43, protein: 0.5, carbs: 11, fats: 0.3, baseQuantity: '100g' },
  { id: 'melancia', name: 'Melancia', category: 'fruta', calories: 30, protein: 0.6, carbs: 7.6, fats: 0.2, baseQuantity: '100g' },
  { id: 'morango', name: 'Morango', category: 'fruta', calories: 33, protein: 0.7, carbs: 7.7, fats: 0.3, baseQuantity: '100g' },
  { id: 'uva_passa', name: 'Uva Passa', category: 'fruta', calories: 299, protein: 3, carbs: 79, fats: 0.5, baseQuantity: '100g' },
  { id: 'laranja', name: 'Laranja', category: 'fruta', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, baseQuantity: '100g' },
  { id: 'abacaxi', name: 'Abacaxi', category: 'fruta', calories: 50, protein: 0.5, carbs: 13, fats: 0.1, baseQuantity: '100g' },

  // VEGETAIS E LEGUMES
  { id: 'alface', name: 'Alface Americana/Crespa', category: 'vegetal', calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, baseQuantity: '100g' },
  { id: 'brocolis', name: 'Brócolis Cozido no Vapor', category: 'vegetal', calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4, baseQuantity: '100g' },
  { id: 'cenoura', name: 'Cenoura Ralada', category: 'vegetal', calories: 41, protein: 0.9, carbs: 9.6, fats: 0.2, baseQuantity: '100g' },
  { id: 'tomate', name: 'Tomate Cereja/Salada', category: 'vegetal', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, baseQuantity: '100g' },
  { id: 'espinafre', name: 'Espinafre Refogado', category: 'vegetal', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, baseQuantity: '100g' },
  { id: 'abobrinha', name: 'Abobrinha Grelhada', category: 'vegetal', calories: 17, protein: 1.2, carbs: 3.1, fats: 0.3, baseQuantity: '100g' },
  { id: 'pepino', name: 'Pepino', category: 'vegetal', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, baseQuantity: '100g' },
  { id: 'vagem', name: 'Vagem Cozida', category: 'vegetal', calories: 31, protein: 1.8, carbs: 7, fats: 0.2, baseQuantity: '100g' },

  // SUPLEMENTOS E OUTROS
  { id: 'whey_protein', name: 'Whey Protein Isolado/Concentrado', category: 'suplemento', calories: 390, protein: 80, carbs: 5, fats: 5, baseQuantity: '100g' },
  { id: 'albumina', name: 'Albumina em Pó', category: 'suplemento', calories: 350, protein: 80, carbs: 4, fats: 0, baseQuantity: '100g' },
  { id: 'creatina', name: 'Creatina Monohidratada', category: 'suplemento', calories: 0, protein: 0, carbs: 0, fats: 0, baseQuantity: '100g' },
  { id: 'glutamina', name: 'Glutamina', category: 'suplemento', calories: 0, protein: 0, carbs: 0, fats: 0, baseQuantity: '100g' },
  { id: 'omega3', name: 'Ômega 3 (Cápsula)', category: 'suplemento', calories: 9, protein: 0, carbs: 0, fats: 1, baseQuantity: '1 unidade' },
  { id: 'cafeina', name: 'Cafeína Anidra', category: 'suplemento', calories: 0, protein: 0, carbs: 0, fats: 0, baseQuantity: '1 unidade' },
  { id: 'multivitaminico', name: 'Multivitamínico', category: 'suplemento', calories: 0, protein: 0, carbs: 0, fats: 0, baseQuantity: '1 unidade' },
  { id: 'seitan', name: 'Seitan (Glúten de Trigo)', category: 'proteina', calories: 370, protein: 75, carbs: 14, fats: 1.9, baseQuantity: '100g' },
  { id: 'edamame', name: 'Edamame Cozido', category: 'proteina', calories: 122, protein: 11, carbs: 10, fats: 5, baseQuantity: '100g' },
  { id: 'proteina_soja', name: 'Proteína de Soja Texturizada', category: 'proteina', calories: 330, protein: 50, carbs: 30, fats: 1, baseQuantity: '100g' },
  { id: 'lombo_porco', name: 'Lombo de Porco Grelhado', category: 'proteina', calories: 242, protein: 27, carbs: 0, fats: 14, baseQuantity: '100g' },
  { id: 'sobrecoxa_frango', name: 'Sobrecoxa de Frango (sem pele)', category: 'proteina', calories: 160, protein: 25, carbs: 0, fats: 6, baseQuantity: '100g' },
  { id: 'sardinha_conserva', name: 'Sardinha em Conserva', category: 'proteina', calories: 208, protein: 25, carbs: 0, fats: 11, baseQuantity: '100g' },
  { id: 'inhame', name: 'Inhame Cozido', category: 'carboidrato', calories: 118, protein: 1.5, carbs: 28, fats: 0.2, baseQuantity: '100g' },
  { id: 'milho_cozido', name: 'Milho Verde Cozido', category: 'carboidrato', calories: 108, protein: 3.3, carbs: 25, fats: 1.3, baseQuantity: '100g' },
  { id: 'castanha_caju', name: 'Castanha de Caju', category: 'gordura', calories: 553, protein: 18, carbs: 30, fats: 44, baseQuantity: '100g' },
  { id: 'semente_linhaca', name: 'Semente de Linhaça', category: 'gordura', calories: 534, protein: 18, carbs: 29, fats: 42, baseQuantity: '100g' },
  { id: 'kiwi', name: 'Kiwi', category: 'fruta', calories: 61, protein: 1.1, carbs: 15, fats: 0.5, baseQuantity: '100g' },
  { id: 'pera', name: 'Pêra', category: 'fruta', calories: 57, protein: 0.4, carbs: 15, fats: 0.1, baseQuantity: '100g' },
  { id: 'aspargos', name: 'Aspargos Grelhados', category: 'vegetal', calories: 20, protein: 2.2, carbs: 3.9, fats: 0.1, baseQuantity: '100g' },
  { id: 'berinjela', name: 'Berinjela Grelhada', category: 'vegetal', calories: 25, protein: 1, carbs: 6, fats: 0.2, baseQuantity: '100g' },
  { id: 'couve_flor', name: 'Couve-Flor Cozida', category: 'vegetal', calories: 25, protein: 1.9, carbs: 5, fats: 0.3, baseQuantity: '100g' },
  { id: 'hipercalorico', name: 'Suplemento Hipercalórico', category: 'suplemento', calories: 400, protein: 20, carbs: 80, fats: 3, baseQuantity: '100g' },
];

