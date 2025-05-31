'use server'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createStreamableValue } from 'ai/rsc';
import {  streamText }  from 'ai'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`

  const result = await db.$queryRaw<Array<{ fileName: string; sourceCode: string; summary: string }>>`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `
  let context = ""
  for(const doc of result){
     context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
  }
// let stream;
  (async () => {
  const { textStream } =  streamText({
    model: google('gemini-1.5-flash'),
    prompt: `
You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is new to the codebase.
AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the codebase.
If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no ambiguity.

if the quetiin is not related to the codebase, provide a answer according to the internet.
    `,
  });

  for await (const chunk of textStream) {
    stream.update(chunk);
  }
  stream.done();
  // stream = textStream;
  // console.log("stream created", textStream)
})();

  return {
    output: stream.value,
    // output:stream,
    fileReferenced: result
  }
}
