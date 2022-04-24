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

    // /**
    //  * Video MPD file URL
    //  */
    // videoUrl: string

    // /**
    //  * Thumbnail MPD image URL
    //  */
    // thumbnailUrl: string

    /**
     * pid
     */
    pid: string
    /**
     * video id
     */
    vid: string

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
