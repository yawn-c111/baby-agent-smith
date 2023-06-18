import fs from 'fs'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'

require('dotenv').config()

const solFilePath = './contracts/Contract1.sol'
const sampleAuditReportPath = './smith/references/sample-audit-report.md'

export const main = async () => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
  })

  const initialSystemMessage = new SystemChatMessage(
    'あなたはスマートコントラクトの監査のプロです。'
  )

  const instruction1 = '以下のスマートコントラクトをステップバイステップで理解して。次に、コードを網羅的に監査して。その後、バグがあったら報告して。'

  const solFile: string = fs.readFileSync(solFilePath, 'utf8')

  const response = await chat.call([
    initialSystemMessage,
    new HumanChatMessage(
      `${instruction1}\n${solFile}`
    ),
  ])
  console.log(response)

  const sampleAuditReport: string = fs.readFileSync(sampleAuditReportPath, 'utf8')

  console.log(sampleAuditReport)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})