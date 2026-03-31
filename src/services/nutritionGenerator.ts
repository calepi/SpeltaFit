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
  weeklyVariations?: {
    day: string;
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
  try {
    const prompt = `
      Aja como um nutricionista esportivo profissional de elite.
      Gere um plano alimentar personalizado e criativo baseado nos seguintes dados do aluno:
      
      DADOS FÍSICOS (SpeltaFit):
      - Nome: ${anamnesis.name || 'Aluno'}
      - Idade: ${anamnesis.age || 'Não informada'}
      - Gênero: ${anamnesis.gender || 'Não informado'}
      - Peso: ${anamnesis.weight || 'Não informado'}kg
      - Altura: ${anamnesis.height || 'Não informada'}cm
      - Objetivo: ${anamnesis.goal || 'Saúde e Bem-estar'}
      - Nível de Atividade: ${anamnesis.experience || 'Iniciante'} (${anamnesis.daysPerWeek || 3} dias/semana)
      
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
      3. O aluno prefere ter ${nutritionalAnamnesis.mealCount} refeições por dia. Tente respeitar essa quantidade, mas ajuste se for estritamente necessário para os objetivos.
      4. VARIABILIDADE SEMANAL: O aluno não quer um cardápio único para todos os dias. Forneça OBRIGATORIAMENTE uma lista de variações para cada dia da semana (Segunda a Domingo) para as refeições principais (Almoço e Jantar) para que ele possa alternar e ter um cardápio diversificado no mês.
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
                  weeklyVariations: {
                    type: Type.ARRAY,
                    description: "Lista de variações para os dias da semana (Segunda a Domingo)",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING, description: "Ex: Segunda-feira" },
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
                      required: ["day", "foods"]
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

    if (!response.text) {
      throw new Error("Resposta vazia da IA.");
    }

    const result = JSON.parse(response.text);
    
    if (!result || typeof result !== 'object') {
      throw new Error("Formato de resposta inválido.");
    }

    return {
      ...result,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro detalhado na geração do plano:", error);
    throw error;
  }
}
