import fs from 'fs'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'
import { ConversationChain } from 'langchain/chains'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from 'langchain/prompts'
import { BufferMemory } from 'langchain/memory'

require('dotenv').config()

const basePath = './matrix/zion'

const target = `Contract1`

const solFilePath = `./contracts/${target}.sol`

const sampleAuditReportPath = './matrix/keymaker/sample-audit-report.md'

export const run = async () => {
  const chat = new ChatOpenAI({
    streaming: true,
    modelName: 'gpt-4',
    temperature: 0,
  })

  const initialSystemMessage = 'あなたはスマートコントラクトの監査のプロフェッショナルです。'

  const instruction1_1 = '以下のスマートコントラクトをステップバイステップで理解して。'

  const instruction1_2 = '次に、コードを包括的かつツリー構造で考え、それを監査して。そして、バグがあれば報告して。'

  const instruction1_3 = `次に、見つかったバグを脆弱性のレベルに応じてH、M、Lに分類して。`

  const instruction2 = '以下のサンプルに従って、発見したバグのレポートをマークダウン形式で書いて。'

  const solFile: string = fs.readFileSync(solFilePath, 'utf8')

  const sampleAuditReport: string = fs.readFileSync(sampleAuditReportPath, 'utf8')

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(initialSystemMessage),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{input}'),
  ])

  const chain = new ConversationChain({
    memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
    prompt: chatPrompt,
    llm: chat,
  })

  const response1 = await chain.call({
    input: `${instruction1_1}\n${solFile}\n${instruction1_2}\n${instruction1_3}`,
  }, [
    {
      handleLLMNewToken(token: string) {
        process.stdout.write(token);
      },
    },
  ])
  console.log(response1.token)

  const response2 = await chain.call({
    input: `${instruction2}\n${sampleAuditReport}}`,
  }, [
    {
      handleLLMNewToken(token: string) {
        process.stdout.write(token);
      },
    },
  ])
  console.log(response2.token)

  if (!fs.existsSync(`${basePath}/${target}`)) {
    fs.mkdirSync(`${basePath}/${target}`, { recursive: true });
  }

  try {
    fs.writeFileSync(`${basePath}/${target}/bug-report.md`, response2.response);
    console.log('Successfully written to the file.');
  } catch (err) {
      console.error('Error occurred:', err);
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})