import "./util/firebase/init"
import { DB } from "./model/db"
import { Episode } from "./types/episode"

async function main() {
    const db = new DB()

    const episode: Episode = {
        title: {
            en: "Episode 1",
            ja: "エピソード1",
        },
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: {
            en: "Sample category",
            ja: "サンプルカテゴリ",
        },
        words: [],
        question: {
            en: "Is this a question?",
            ja: "これは質問ですか？",
        },
        transcript: {},
        answer: {
            en: "Yes, it is.",
            ja: "はい、そうです。",
        },
    }

    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const res = await db.createEpisode(episode, id)

    const episodes = await db.getAllEpisodes()
    console.log(episodes)
}

main()
