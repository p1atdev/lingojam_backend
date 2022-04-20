import googleTranslateApi from "@vitalets/google-translate-api"
import { Translation } from "../types/translation"
// import { translator } from "../util/deepl/client"
import { translator } from "../util/google/translator"

export class Translator {
    async enToJaText(text: string): Promise<Translation> {
        // const result = await translator.translateText(text, "en", "ja")
        const result = (await translator.translateText(text, "en", "ja")) as googleTranslateApi.ITranslateResponse

        // result is not an array
        const translated: Translation = {
            en: text,
            ja: result.text,
        }

        return translated
    }
    async enToJaTexts(texts: string[]): Promise<Translation[]> {
        // const results = await translator.translateText(texts, "en", "ja")
        const results = (await translator.translateText(texts, "en", "ja")) as googleTranslateApi.ITranslateResponse[]

        return results.map((result, index) => {
            const translated: Translation = {
                en: texts[index],
                ja: result.text,
            }
            return translated
        })
    }
}
