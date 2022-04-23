import { parse } from "date-fns"
import { JSDOM } from "jsdom"
import { Episode } from "../types/episode"
import { Sentence, Transcript } from "../types/transcript"
import { Translation } from "../types/translation"
import { Word } from "../types/word"
import { getSentence, getSentences } from "../util/parse/main"
import { Translator } from "./translator"

export class Parser {
    html: string
    document: Document

    translator: Translator
    constructor(html: string) {
        this.html = html
        this.document = new JSDOM(html).window.document

        this.translator = new Translator()
    }

    // async getTranslate(element: Element | Element[]): Promise<Translation | Translation[] | undefined> {
    //     if (Array.isArray(element)) {
    //         return await this.translator.enToJaTexts(element.map((e) => e.textContent ?? "ERROR"))
    //     } else {
    //         return await this.translator.enToJaText(element.textContent ?? "ERROR")
    //     }
    // }

    parseToContent() {
        const content = this.document.querySelector("div.widget.widget-richtext div.text")

        return content
    }

    async parseToEpisode() {
        const document = this.parseToContent()
        if (!document) {
            return null
        }
        const elements = Array.from(document.querySelectorAll("*"))

        try {
            const episodeNumber = this.parseEpisodeNumber()
            const videoUrl = this.parseVideoURL()
            const date = this.parseDate()

            const [title, category, words, question, transcript, answer] = await Promise.all([
                this.parseTitle(elements),
                this.parseCategory(elements),
                this.parseWords(elements),
                this.parseQuestion(elements),
                this.parseTranscript(elements),
                this.parseAnswer(elements),
            ])

            const episode: Episode = {
                number: episodeNumber,
                date: date,
                title: title,
                videoUrl: videoUrl!,
                category: category,
                words: words,
                question: question,
                transcript: transcript,
                answer: answer,
            }

            return episode
        } catch (err) {
            console.log("Error", err)
        }
    }

    parseEpisodeNumber = (): string => {
        const document = this.parseToContent()
        if (!document) {
            throw new Error("No document")
        }

        const numberEl = this.document.querySelector("div div.details h3 b")
        if (!numberEl) {
            throw new Error("No number")
        }
        return numberEl.innerHTML.split(" ")[1]
    }

    parseDate = (): Date => {
        const document = this.parseToContent()
        if (!document) {
            throw new Error("No document")
        }

        const dateEl = this.document.querySelector("div div.details h3")
        if (!dateEl) {
            throw new Error("No date")
        }

        const dateText = dateEl.textContent?.split("/")[1].trim() ?? ""

        const date = parse(dateText, "d MMM yyyy", new Date())
        return date
    }

    parseVideoURL = (): string | null => {
        const iframe = this.document.querySelector("iframe")?.innerHTML
        console.log(iframe)
        console.log(iframe?.includes("568ec290-626e-4ddb-83fa-6b52928eb728"))
        return ""

        // const document = this.document.querySelector("iframe#smphtml5iframebbcMediaPlayer0")
        // if (!document) {
        //     throw new Error("No content")
        // }

        // const videoEl = this.document.querySelector("video.p_transform")
        // if (!videoEl) {
        //     throw new Error("No video element")
        // }

        // return videoEl.getAttribute("src")
    }

    parseTitle = async (elements: Element[]): Promise<Translation> => {
        const titleEl = getSentence(elements, "The story…")
        if (!titleEl) {
            throw new Error("No title")
        }
        if (!titleEl.textContent) {
            throw new Error("No title text")
        }
        const title: Translation = await this.translator.enToJaText(titleEl.textContent)
        // console.log(title)
        return title
    }

    parseCategory = async (elements: Element[]): Promise<Translation> => {
        const categoryEl = getSentence(elements, "Learn language related to…")
        if (!categoryEl) {
            throw "No category"
        }
        if (!categoryEl.textContent) {
            throw "No category text"
        }
        const category: Translation = await this.translator.enToJaText(categoryEl.textContent)
        // console.log(category)
        return category
    }

    parseWords = async (elements: Element[]): Promise<Word[]> => {
        const wordEls = getSentences(elements, "Need-to-know language…", "Answer this…")
        if (!wordEls) {
            throw new Error("No words")
        }

        const wordPairs = (
            await Promise.all(
                wordEls
                    .filter((e) => e.tagName == "P")
                    .map(async (wordText) => {
                        const text = wordText.textContent
                        if (!text) {
                            return
                        }

                        const [word, meaning] = text.split("–").map((s) => s.trim())

                        return {
                            word: await this.translator.enToJaText(word),
                            meaning: await this.translator.enToJaText(meaning),
                        }
                    })
            )
        ).filter((s): s is Word => {
            return s != undefined && s != null
        })

        // console.log(wordPairs)

        return wordPairs
    }

    parseQuestion = async (elements: Element[]): Promise<Translation> => {
        const questionEl = getSentence(elements, "Answer this…")
        if (!questionEl) {
            throw new Error("No question")
        }
        if (!questionEl.textContent) {
            throw new Error("No question text")
        }
        const question: Translation = await this.translator.enToJaText(questionEl.textContent)
        // console.log(question)
        return question
    }

    parseTranscript = async (elements: Element[]): Promise<Transcript> => {
        const transcriptEl = getSentences(elements, "Transcript", "Did you get it?")
        if (!transcriptEl) {
            throw new Error("No transcript")
        }

        const sentences = (
            await Promise.all(
                transcriptEl
                    .filter((e) => e.tagName == "P")
                    .map(async (text) => {
                        // console.log("sentence:", sentence)
                        // console.log("sentence.tagName:", sentence.tagName)
                        // console.log("sentence.textContent:", sentence.textContent)

                        const content = text.textContent
                        if (!content) {
                            return
                        }

                        const sentence: Sentence = {
                            text: await this.translator.enToJaText(content),
                            type: text.innerHTML.startsWith("<strong>") ? "heading" : "paragraph",
                        }

                        return sentence
                    })
            )
        ).filter((s): s is Sentence => {
            return s != undefined && s != null
        })

        const transcript: Transcript = {
            sentences: sentences,
        }

        // console.dir(transcript, { depth: null })
        return transcript
    }

    parseAnswer = async (elements: Element[]): Promise<Translation[]> => {
        const answerEls = (() => {
            const answerIndex = elements.findIndex((e) => e.textContent == "Did you get it?")
            if (answerIndex == -1) {
                return undefined
            }

            return elements.slice(answerIndex + 2)
        })()
        if (!answerEls) {
            throw "No answer"
        }
        const answer: Translation[] = (
            await Promise.all(
                answerEls.map(async (e) => {
                    if (!e.textContent) {
                        return
                    }
                    return await this.translator.enToJaText(e.textContent)
                })
            )
        ).filter((s): s is Translation => {
            return s != undefined && s != null
        })

        // console.log(answer)
        return answer
    }
}
