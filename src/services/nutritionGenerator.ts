import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface NutritionalAnamnesis {
  mealCount?: number;
  dietType: string;
  allergies?: string;
  dislikes?: string;
  budget?: string;
  cookingTime?: string;
  supplements?: string[];
  waterIntake?: number;
  updatedAt: string;
}

export interface Food {
  item: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  name: string;
  time: string;
  foods: Food[];
  variations?: {
    description: string;
    foods: Food[];
  }[];
}

export interface DietPlan {
  goal: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  supplementation: string;
  recommendations: string;
  createdAt: string;
}

export async function generateDietPlan(
  anamnesis: any, // Physical anamnesis from SpeltaFit
  nutritionalAnamnesis: NutritionalAnamnesis
): Promise<DietPlan> {
  const prompt = `
    Aja como um nutricionista esportivo profissional de elite.
    Gere um plano alimentar personalizado e criativo baseado nos seguintes dados do aluno:
    
    DADOS FÍSICOS (SpeltaFit):
    - Nome: ${anamnesis.name}
    - Idade: ${anamnesis.age}
    - Gênero: ${anamnesis.gender}
    - Peso: ${anamnesis.weight}kg
    - Altura: ${anamnesis.height}cm
    - Objetivo: ${anamnesis.goal}
    - Nível de Atividade: ${anamnesis.experience} (${anamnesis.daysPerWeek} dias/semana)
    
    PREFERÊNCIAS NUTRICIONAIS:
    - Tipo de Dieta: ${nutritionalAnamnesis.dietType}
    - Alergias: ${nutritionalAnamnesis.allergies || 'Nenhuma'}
    - Não gosta de: ${nutritionalAnamnesis.dislikes || 'Nada específico'}
    - Orçamento: ${nutritionalAnamnesis.budget || 'Padrão'}
    - Tempo para cozinhar: ${nutritionalAnamnesis.cookingTime || 'Padrão'}
    - Suplementos atuais/desejados: ${nutritionalAnamnesis.supplements?.join(', ') || 'Nenhum'}
    
    REQUISITOS ESPECÍFICOS:
    1. O cardápio deve ser profissional, elegante e variado.
    2. Use alimentos de fácil acesso no Brasil.
    3. Defina a QUANTIDADE IDEAL DE REFEIÇÕES baseando-se no treino e objetivos do aluno.
    4. VARIABILIDADE SEMANAL: O aluno não quer um cardápio único para todos os dias. Forneça OBRIGATORIAMENTE variações para cada dia da semana ou pelo menos 3 opções distintas por refeição principal (Almoço e Jantar) para que ele possa alternar e ter um cardápio diversificado no mês.
    5. Inclua recomendações de Creatina e Whey Protein se o objetivo for hipertrofia ou manutenção de massa.
    6. Calcule as calorias e macros de forma precisa.
    7. Seja criativo nas combinações.
    
    Retorne a resposta EXATAMENTE no formato JSON solicitado.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goal: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            },
            required: ["protein", "carbs", "fats"]
          },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.STRING },
                foods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fats: { type: Type.NUMBER }
                    },
                    required: ["item", "quantity", "calories", "protein", "carbs", "fats"]
                  }
                },
                variations: {
                  type: Type.ARRAY,
                  description: "Opções alternativas para a mesma refeição (especialmente almoço/jantar)",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING, description: "Ex: Opção 2: Peixe com Legumes" },
                      foods: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            item: { type: Type.STRING },
                            quantity: { type: Type.STRING },
                            calories: { type: Type.NUMBER },
                            protein: { type: Type.NUMBER },
                            carbs: { type: Type.NUMBER },
                            fats: { type: Type.NUMBER }
                          },
                          required: ["item", "quantity", "calories", "protein", "carbs", "fats"]
                        }
                      }
                    },
                    required: ["description", "foods"]
                  }
                }
              },
              required: ["name", "time", "foods"]
            }
          },
          supplementation: { type: Type.STRING },
          recommendations: { type: Type.STRING }
        },
        required: ["goal", "calories", "macros", "meals", "supplementation", "recommendations"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    createdAt: new Date().toISOString()
  };
}
