import { format, parse } from "date-fns"
import { JSDOM } from "jsdom"
import { $fetch } from "ohmyfetch"
import { Episode } from "../types/episode"
import { MediaSet } from "../types/mediaset"
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

    parseToContent() {
        const content = this.document.querySelector("div.widget.widget-richtext div.text")

        return content
    }

    async parseToEpisode(thumbnailUrl: string) {
        console.log(thumbnailUrl)

        const document = this.parseToContent()
        if (!document) {
            return null
        }
        const elements = Array.from(document.querySelectorAll("*"))

        try {
            const episodeNumber = this.parseEpisodeNumber()
            const date = this.parseDate()

            const [media, title, category, words, question, transcript, answer] = await Promise.all([
                this.parseMediaIds(),
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
                thumbnailUrl: thumbnailUrl,
                pid: media.pid,
                vid: media.vid,
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

    parseDate = (): string => {
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
        return format(date, "yyy/MM/dd")
    }

    parseMediaIds = async () => {
        const pid = this.document.querySelector("div.video")?.getAttribute("data-pid")
        if (!pid) {
            throw new Error("No data-pid")
        }

        const xmlUrl = `https://www.bbc.co.uk/learningenglish/playlist/${pid}`
        const xml = await $fetch(xmlUrl)

        const xmlDoc = new JSDOM(xml).window.document
        const vid = xmlDoc.querySelector("mediator")?.getAttribute("identifier")

        if (!vid) {
            throw new Error("No vid")
        }

        return {
            pid: pid,
            vid: vid,
        }
    }

    parseMediaURL = async () => {
        const dataPid = this.document.querySelector("div.video")?.getAttribute("data-pid")
        if (!dataPid) {
            throw new Error("No data-pid")
        }

        const mediaSet = await this.getMediaSet(dataPid)

        return mediaSet
    }

    parseTitle = async (elements: Element[]): Promise<Translation> => {
        // console.log("parseTitle")
        const titleEl = getSentence(elements, "The story")
        if (!titleEl) {
            throw new Error("No title")
        }
        if (!titleEl.textContent) {
            throw new Error("No title text")
        }
        const title: Translation = await this.translator.enToJaText(titleEl.textContent)
        // console.log("title:", title)
        return title
    }

    parseCategory = async (elements: Element[]): Promise<Translation> => {
        // console.log("parseCategory")
        const categoryEl = getSentence(elements, "Learn language related to")
        if (!categoryEl) {
            throw "No category"
        }
        if (!categoryEl.textContent) {
            throw "No category text"
        }
        const category: Translation = await this.translator.enToJaText(categoryEl.textContent)
        // console.log("category:", category)
        return category
    }

    parseWords = async (elements: Element[]): Promise<Word[]> => {
        // console.log("parseWords")
        const wordEls = getSentences(elements, "Need-to-know language", "Answer this")
        if (!wordEls) {
            throw new Error("No words")
        }

        const wordPairs = (
            await Promise.all(
                wordEls
                    .filter((e) => e.tagName == "P")
                    .map(async (wordEl) => {
                        const text = wordEl.textContent
                        if (!text) {
                            return
                        }

                        const word = wordEl.querySelector("strong")?.textContent?.trim()

                        if (!word) {
                            return
                        }

                        // const meaning = text.split("–").map((s) => s.trim())
                        const meaning = text.replace(word, "").replace(/[–-]/, "").trim()

                        // console.log({
                        //     word,
                        //     meaning,
                        // })

                        const pair = {
                            word: await this.translator.enToJaText(word),
                            meaning: await this.translator.enToJaText(meaning),
                        }

                        // console.log(pair)

                        return pair
                    })
            )
        ).filter((s): s is Word => {
            return s != undefined && s != null
        })

        // console.log("wordPairs:", wordPairs)

        return wordPairs
    }

    parseQuestion = async (elements: Element[]): Promise<Translation> => {
        // console.log("parseQuestion")
        const questionEl = getSentence(elements, "Answer this")
        if (!questionEl) {
            throw new Error("No question")
        }
        if (!questionEl.textContent) {
            throw new Error("No question text")
        }
        const question: Translation = await this.translator.enToJaText(questionEl.textContent)
        // console.log("question:", question)
        return question
    }

    parseTranscript = async (elements: Element[]): Promise<Transcript> => {
        // console.log("parseTranscript")
        const transcriptEl =
            getSentences(elements, "Transcript", "Did you get it?") ??
            getSentences(elements, "Transcript", "Answer this")
        if (!transcriptEl) {
            throw new Error("No transcript")
        }

        const strongs = transcriptEl
            .filter((e) => e.tagName == "STRONG")
            .map((e) => {
                return e.textContent?.trim()
            })
            .filter((s): s is string => {
                return s != undefined && s != null
            })

        // console.log("strongs", strongs)

        const sentences = (
            await Promise.all(
                transcriptEl
                    .filter((e) => e.tagName == "P")
                    .map(async (text) => {
                        // console.log("text:", text)
                        // console.log("text.tagName:", text.tagName)
                        // console.log("text.textContent:", text.textContent)
                        // console.log("text.innerHTML:", text.innerHTML)

                        const headingText = strongs.find((s) => text.textContent?.startsWith(s))
                        if (headingText) {
                            // if with heading

                            // console.log("headingText:", headingText)

                            // console.log({
                            //     heading: headingText,
                            //     content: text.textContent?.replace(headingText, "").trim(),
                            //     textContent: text.textContent,
                            // })

                            const heading: Sentence = {
                                type: "heading",
                                text: await this.translator.enToJaText(headingText),
                            }

                            const content = text.textContent
                            if (!content) {
                                return
                            }

                            // console.log("content:", content)

                            const sentence: Sentence = {
                                type: "paragraph",
                                text: await this.translator.enToJaText(content.replace(headingText, "").trim()),
                            }

                            return [heading, sentence]
                        } else {
                            // if only paragraph

                            const content = text.textContent
                            if (!content) {
                                return
                            }

                            // console.log("content:", content)
                            // console.log({
                            //     content: content,
                            // })

                            const sentence: Sentence = {
                                type: "paragraph",
                                text: await this.translator.enToJaText(content),
                            }

                            return sentence
                        }
                    })
            )
        )
            .flat()
            .filter((s): s is Sentence => {
                return s != undefined && s != null
            })

        const transcript: Transcript = {
            sentences: sentences,
        }

        // console.dir(transcript, { depth: null })
        return transcript
    }

    parseAnswer = async (elements: Element[]): Promise<Translation[]> => {
        // console.log("parseAnswer")
        const answerEls = (() => {
            const answerIndex = elements.findIndex((e) => e.textContent == "Did you get it?")

            if (answerIndex == -1) {
                // BBCが悪い。Did you get it?を誤ってAnswer this…にしている。
                const answerThisEls = elements
                    .filter((e) => e.tagName === "H3")
                    .filter((e) => e.textContent?.startsWith("Answer this"))
                if (answerThisEls.length > 1) {
                    const index = elements.indexOf(answerThisEls[1])
                    return elements.slice(index + 2)
                }
            } else {
                return elements.slice(answerIndex + 2)
            }
        })()
        if (!answerEls) {
            // throw Error("No answer")
            return []
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

        // console.log("answer:", answer)
        return answer
    }

    getMediaSet = async (pid: string) => {
        const xmlUrl = `https://www.bbc.co.uk/learningenglish/playlist/${pid}`
        const xml = await $fetch(xmlUrl)

        const xmlDoc = new JSDOM(xml).window.document
        const vid = xmlDoc.querySelector("mediator")?.getAttribute("identifier")

        const mediaUrl = `https://open.live.bbc.co.uk/mediaselector/6/select/version/2.0/mediaset/pc/vpid/${vid}/format/json`
        const mediaSet: MediaSet = await $fetch(mediaUrl)

        const thumbnail = mediaSet.media
            .find((m) => m.kind === "thumbnails")
            ?.connection.filter((c) => c.protocol === "https")
            .sort((a, b) => parseInt(a.priority) - parseInt(b.priority))[0]

        const video = mediaSet.media
            .find((m) => m.kind === "video")
            ?.connection.filter((c) => c.protocol === "https")
            .filter((c) => c.transferFormat === "dash")[0]

        if (!thumbnail || !video) {
            throw new Error("No media")
        }

        return {
            thumbnail: thumbnail.href,
            video: video.href,
        }
    }
}
