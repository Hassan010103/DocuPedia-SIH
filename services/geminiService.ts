
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Document, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        inlineData: {
          data: result.split(',')[1],
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateSummary = async (file: File): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        
        if (file.type.startsWith('image/')) {
            const imagePart = await fileToGenerativePart(file);
            const textPart = { text: `Provide a concise, one-sentence summary of this image, which is from a document named "${file.name}".` };
            const response = await ai.models.generateContent({
                model,
                contents: { parts: [imagePart, textPart] },
            });
            return response.text.trim();
        } else {
            const prompt = `Provide a concise, one-sentence summary for a document titled "${file.name}". Infer its purpose from the title.`;
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return response.text.trim();
        }
    } catch (error) {
        console.error("Error generating summary with Gemini API:", error);
        return "AI could not generate a summary for this file.";
    }
};

export const generateDocumentContent = async (document: Document): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const fileType = document.type.toLowerCase();

    if (['png', 'jpg', 'jpeg'].includes(fileType)) {
        // For images, we don't need to call the API, the component will handle it.
        return document.thumbnailUrl || 'Image content';
    }

    let prompt = '';

    if (['xlsx', 'xls'].includes(fileType)) {
        prompt = `
            Given the following spreadsheet metadata:
            - Name: "${document.name}"
            - Summary: "${document.summary || 'No summary available.'}"
            - Department: "${document.department}"

            Generate a sample of the data that would be in this spreadsheet. 
            Format the output as a simple, plain-text table using pipes (|) for columns and dashes (-) for the header separator. 
            Create realistic column headers and at least 10 rows of plausible data related to the document's name and summary.
            Do NOT include any introductory phrases like "Here is the content...". Just output the table.
        `;
    } else { // Default to text-based documents (PDF, DOCX, etc.)
        prompt = `
            You are a document generator. Based on the document name "${document.name}" and its summary "${document.summary || 'No summary available.'}", generate a full-page text content that plausibly looks like the original document.
            The document is for the "${document.department}" department.
            
            Format the output realistically as if it were the actual document. 
            Use Markdown for formatting:
            - Use '#' for the main title.
            - Use '##' for section headings.
            - Use '*' for bullet points.
            - Use '**text**' for bolding important terms.
            
            The tone should be professional and appropriate for a corporate document.
            Ensure the content is detailed, spanning several paragraphs and sections.
            Do NOT add any preamble like "Here is the content". Start directly with the document's content (e.g., a title).
        `;
    }
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating document content with Gemini API:", error);
        return `Error: Could not generate content for ${document.name}.`;
    }
};


export const analyzeDocumentForDetailPage = async (documentName: string, documentSummary: string | undefined): Promise<AIAnalysisResult> => {
    try {
        const prompt = `
        Analyze the following document based on its name and existing summary. Provide a detailed analysis in JSON format.
        Document Name: "${documentName}"
        Existing Summary: "${documentSummary || 'Not available.'}"

        Your analysis should include:
        1.  **Authenticity Score**: An estimated score (0-100) of how likely this document is to be authentic and not a fake, based on naming conventions and common document types. Provide brief reasoning.
        2.  **Key Points**: A bulleted list of 3-5 likely key points or topics based on the title.
        3.  **Detailed Summary**: A more detailed, one-paragraph summary.
        4.  **Suggested Actions**: Suggest 1-2 relevant actions. For example, if it's a financial report, suggest forwarding to the 'Finance' team. If it's a contract, suggest forwarding to a specific user for review.
        5.  **Reminders**: Identify any potential dates or deadlines from the document name (e.g., "Q4" implies end-of-year). If none, return an empty array.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        authenticity: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.INTEGER },
                                reasoning: { type: Type.STRING }
                            }
                        },
                        keyPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        summary: { type: Type.STRING },
                        suggestedActions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    action: { type: Type.STRING },
                                    reasoning: { type: Type.STRING },
                                    target: { type: Type.STRING }
                                }
                            }
                        },
                        reminders: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as AIAnalysisResult;
    } catch (error) {
        console.error("Error analyzing document with Gemini API:", error);
        // Provide a structured error response that matches the type
        return {
            authenticity: { score: 0, reasoning: 'AI analysis failed to run.' },
            keyPoints: ['Could not determine key points due to an error.'],
            summary: 'Could not generate a detailed summary due to an error.',
            suggestedActions: [],
            reminders: [],
        };
    }
};

export async function* getChatbotResponseStream(
  history: ChatMessage[],
  documentContext?: Document,
  allDocuments?: Document[]
): AsyncGenerator<string> {
  const lastUserMessage = history[history.length - 1]?.text.toLowerCase().trim();

  // Hardcoded Q&A checks
  if (lastUserMessage.includes("financial revenue")) {
    const answer = "Based on the available documents, you can find information related to financial revenue in the following files:\n\n*   **Q4-Financial-Projections.xlsx**: Contains financial forecasts and revenue growth analysis.\n*   **Annual-Budget-Plan-FY2024.xlsx**: Details the complete financial budget and allocations.\n*   **Expense-Reimbursement-Policy.pdf**: Outlines policies related to company spending, which impacts financials.";
    yield answer;
    return;
  }

  if (lastUserMessage.includes("annual report")) {
    const answer = "Several documents can assist with creating an annual report. I recommend starting with:\n\n*   **Annual-Budget-Plan-FY2024.xlsx**: For financial planning and overview.\n*   **Q3-Performance-Review-Deck.pptx**: For key performance metrics and quarterly results.\n*   **Employee-Handbook-2023-Update.pdf**: For HR and policy-related sections of the report.\n*   **Sustainability-Initiatives-Report.pdf**: For corporate social responsibility sections.";
    yield answer;
    return;
  }

  try {
    const model = 'gemini-2.5-flash';
    
    let contextPrompt = '';
    if (documentContext) {
      contextPrompt = `
        CONTEXT: You are currently discussing a specific document.
        - Document Name: "${documentContext.name}"
        - Summary: "${documentContext.summary || 'Not available.'}"
        - Owner: ${documentContext.owner}
        - Uploaded At: ${documentContext.uploadedAt}
        - Last Version: ${documentContext.versions[documentContext.versions.length - 1].change} by ${documentContext.versions[documentContext.versions.length - 1].editor}
        Answer questions based on this context. Be concise.
      `;
    } else {
        contextPrompt = `
        CONTEXT: You are acting as a general assistant for the entire document repository.
        - There are ${allDocuments?.length || 0} total documents.
        - Key document types include: ${[...new Set(allDocuments?.map(d => d.type))].join(', ')}.
        Answer questions about finding documents, application features, or summarizing information from the repository.
        `;
    }

    const systemInstruction = `You are "Doc Assistant", an expert AI integrated into the KMRL DocStream Nexus. Your persona is helpful, professional, and concise. You can understand and discuss documents. Use Markdown for formatting if necessary (e.g., lists, bold text).`;
    
    const contents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContentStream({
        model,
        contents: contents,
        config: {
            systemInstruction: `${systemInstruction}\n${contextPrompt}`
        }
    });

    for await (const chunk of response) {
      yield chunk.text;
    }

  } catch (error) {
    console.error("Error with Gemini Chat API:", error);
    yield "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}
