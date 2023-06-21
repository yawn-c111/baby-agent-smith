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

const target = `Contract5`

const solFilePath = `./contracts/${target}.sol`

const sampleAuditReportPath = './matrix/keymaker/sample-audit-report.md'

export const run = async () => {
  console.log('\x1b[32m%s\x1b[0m', 'Your Text')
  const chat = new ChatOpenAI({
    streaming: true,
    modelName: 'gpt-4',
    temperature: 0,
  })

  const initialSystemMessage = 'You are a smart contract audit professional'

  const instruction1_1 = 'Understand the following smart contracts step by step.'

  const instruction1_2 = 'Next, think of the code in a comprehensive and tree structure and audit it. Then report any bugs.'

  const instruction1_3 = `Next, classify the bugs found into H, M, and L according to the level of vulnerability.`

  const instruction2 = 'Write a report of the bugs you found in markdown format according to the sample below.'

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
        process.stdout.write(`\x1b[32m${token}\x1b[0m`);
      },
    },
  ])
  console.log('\x1b[32m%s\x1b[0m', response1.token)

  const response2 = await chain.call({
    input: `${instruction2}\n${sampleAuditReport}}`,
  }, [
    {
      handleLLMNewToken(token: string) {
        process.stdout.write(`\x1b[32m${token}\x1b[0m`);
      },
    },
  ])
  console.log('\x1b[32m%s\x1b[0m', response2.token)

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