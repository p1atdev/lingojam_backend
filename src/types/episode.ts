import { Transcript } from "./transcript"
import { Translate } from "./translate"
import { Word } from "./word"

export type Episode = {
    /**
     * The story…
     */
    title: Translate
    videoUrl: string
    /**
     * Learn language related to…
     */
    category: Translate
    /**
     * Need-to-know language…
     */
    words: Word[]
    /**
     * Answer this…
     */
    question: Translate
    /**
     * Transcript
     */
    transcript: Transcript
    /**
     * Did you get it?
     */
    answer: Translate
}
