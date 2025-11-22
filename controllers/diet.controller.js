import PaxSenixAI from "@paxsenix/ai";
import dotenv from 'dotenv'
dotenv.config()
const ai = new PaxSenixAI(process.env.PAXSENIX_API_KEY);

export const generateDietPlan = async (req, res) => {
  const { age, height, weight, goal, dietType, ingredients, gender } = req.body;

  const prompt = `
Calculate BMR using Mifflin-St Jeor formula based on:
Male: BMR = 10 × weight + 6.25 × height - 5 × age + 5
Female: BMR = 10 × weight + 6.25 × height - 5 × age - 161

Then calculate TDEE by multiplying BMR with activity factor 1.2 (sedentary).
Then adjust calories:
- Weight Loss: -500 kcal
- Maintenance: no change
- Weight Gain: +500 kcal

Also compute BMI using:
BMI = weight(kg) / (height(m))^2
Classify BMI (underweight, normal, overweight, obese) and use it to refine diet suggestions.

Now using above calculations, create a one-day diet plan for a ${age}-year-old, ${height} cm, ${weight} kg,
gender: ${gender}
goal: ${goal},
diet type: ${dietType}.
Use only the following ingredients: ${ingredients}.
Return a VALID JSON object only (no markdown).
Wrap all numbers with units (like "150g", "200ml", "2500 kcal") inside quotes.
Format exactly:
{
  "calories": "2500 kcal",
  "macros": { "protein": "150g", "carbs": "200g", "fats": "50g" },
  "meals": {
    "breakfast": "...",
    "lunch": "...",
    "dinner": "...",
    "snacks": "..."
  },
  "tip": "..."
}
Only return the JSON, nothing else.

`;

  try {
    const response = await ai.createChatCompletion({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
    });

    let aiContent = response.choices[0].message.content;
    console.log("Raw AI Response:", aiContent);

    let cleanJson = aiContent.replace(/```json|```/g, "").trim();

    cleanJson = cleanJson.replace(/(\d+)\s?(g|ml|kg|kcal)/g, '"$1$2"');

    let dietData;

    try {
      dietData = JSON.parse(cleanJson);
    } catch (err) {
      console.warn("Primary JSON parsing failed. Trying fallback...");

      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          dietData = JSON.parse(jsonMatch[0]);
        } catch {
          dietData = { raw: aiContent };
        }
      } else {
        dietData = { raw: aiContent };
      }
    }

    return res.status(200).json({ diet: dietData });
  } catch (error) {
    console.error("Error generating diet plan:", error);
    return res.status(500).json({
      message: "Error generating diet plan",
      error: error.message || error,
    });
  }
};
