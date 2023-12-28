import OpenAI from 'openai'

const openaiKey = process.env.OPENAI_KEY as string
const openai = new OpenAI({ apiKey: openaiKey })

const getBusiness = async (user: string) => {
    return {
        name: 'Asas Virtuais',
        context: 'Asas Virtuais is a private initiative with the purpose of providing accessible web technology for small and medium companies'
    }
}

export const getResponse = async ( user: string, message: string) => {
    const business = await getBusiness(user)
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `Answer the following message using only the information in the context of this message.${
                    '\n'
                }The message was sent from a person getting in contact to a business AI.${
                    '\n'
                }The message was sent via a messaging app called WA."${
                    '\n'
                }Business name: ${
                    business.name
                }${
                    '\n'
                }Business context: ${business.context}`
            },
            {
                role: 'user',
                content: message
            }
        ]
    })
    return completion.choices[0].message
}

export default openai

