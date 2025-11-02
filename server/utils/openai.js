import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-testing'
});

// Scan receipt using GPT-4 Vision
export const scanReceipt = async (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "amount": <total amount as number>,
                "description": <merchant name or description>,
                "category": <one of: food, transport, utilities, entertainment, healthcare, shopping, other_expense>,
                "date": <date in ISO format if visible, otherwise null>,
                "items": [<array of item names if visible>]
              }
              Only return valid JSON, no additional text.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    
    return {
      type: 'expense',
      amount: parseFloat(extractedData.amount),
      description: extractedData.description,
      category: extractedData.category,
      date: extractedData.date ? new Date(extractedData.date) : null,
      items: extractedData.items || []
    };
  } catch (error) {
    console.error('Error scanning receipt:', error);
    throw new Error('Failed to scan receipt. Please try again.');
  }
};

// Generate AI insights for monthly report
export const generateMonthlyInsights = async (data) => {
  try {
    const { totalIncome, totalExpenses, balance, topCategories, transactions } = data;

    const prompt = `As a financial advisor, analyze this monthly financial data and provide 3-5 actionable insights:

Total Income: $${totalIncome}
Total Expenses: $${totalExpenses}
Balance: $${balance}
Top Spending Categories: ${topCategories.map(c => `${c.category}: $${c.total}`).join(', ')}
Transaction Count: ${transactions}

Provide insights in JSON format:
{
  "summary": "<brief overall summary>",
  "insights": [
    {
      "title": "<insight title>",
      "description": "<detailed insight>",
      "type": "<positive|warning|tip>"
    }
  ],
  "recommendations": [
    "<actionable recommendation>"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial advisor providing clear, actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate AI insights');
  }
};

