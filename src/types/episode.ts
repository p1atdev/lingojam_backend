import { Transcript } from "./transcript"
import { Translation } from "./translation"
import { Word } from "./word"

export type Episode = {
    /**
     * Episode number
     */
    number: string

    /**
     * Date
     */
    date: Date

    /**
     * The story…
     */
    title: Translation
    videoUrl: string
    /**
     * Learn language related to…
     */
    category: Translation
    /**
     * Need-to-know language…
     */
    words: Word[]
    /**
     * Answer this…
     */
    question: Translation
    /**
     * Transcript
     */
    transcript: Transcript
    /**
     * Did you get it?
     */
    answer: Translation[]
}
