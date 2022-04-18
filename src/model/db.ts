import { db } from "../util/firebase/db"
import { Episode } from "../types/episode"

const episodesRef = "Episodes"

export class DB {
    async getAllEpisodes(): Promise<Episode[]> {
        const { docs } = await db.collection(episodesRef).get()
        const episodes = docs.map((doc) => doc.data() as Episode)
        return episodes
    }

    async createEpisode(episode: Episode, id: string) {
        return await db.collection(episodesRef).doc(id).set(episode)
    }
}
