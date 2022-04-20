import translate from "@vitalets/google-translate-api"

class Translator {
    async translateText(text: string | string[], source: string, target: string) {
        if (Array.isArray(text)) {
            return await Promise.all(text.map((t) => translate(t, { from: source, to: target })))
        } else {
            return await translate(text, { from: source, to: target })
        }
    }
}

export const translator = new Translator()
