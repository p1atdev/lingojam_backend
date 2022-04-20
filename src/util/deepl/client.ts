import { Translator } from "deepl-node"
import { load } from "ts-dotenv"

const env = load({
    DEEPL_API_KEY: String,
})

export const translator = new Translator(env.DEEPL_API_KEY)
