import OpenAI from 'openai'
import auth0 from 'asasvirtuais/src/auth0'

const openaiKey = process.env.OPENAI_KEY as string
const openai = new OpenAI({ apiKey: openaiKey })

const getBusiness = async (user: string) => {
    const res = await auth0.management.users.get({ id: user })
    const metdata = res.data.app_metadata
    if ( ! metdata )
        throw new Error('User has no app_metadata')
    return metdata?.['waweb_business']
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
                }Business context: ${business.description}`
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

