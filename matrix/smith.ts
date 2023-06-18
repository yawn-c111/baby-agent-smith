import fs from 'fs'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'

require('dotenv').config()

const solFilePath = './contracts/Contract1.sol'
const sampleAuditReportPath = './matrix/keymaker/sample-audit-report.md'

export const main = async () => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
  })

  const initialSystemMessage = new SystemChatMessage(
    'あなたはスマートコントラクトの監査のプロです。'
  )

  const instruction1 = '以下のスマートコントラクトをステップバイステップで理解して。'

  const instruction2 = '次に、コードを網羅的かつツリー構造で考えて監査して。その後、バグがあったら報告して。'

  const instruction3 = '最後に発見したバグのレポートを以下のサンプルに従ってマークダウン形式で書いて。'

  const solFile: string = fs.readFileSync(solFilePath, 'utf8')

  const sampleAuditReport: string = fs.readFileSync(sampleAuditReportPath, 'utf8')

  const response = await chat.call([
    initialSystemMessage,
    new HumanChatMessage(
      `${instruction1}\n${solFile}\n${instruction2}\n${instruction3}\n${sampleAuditReport}}`
    ),
  ])
  console.log(response)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})