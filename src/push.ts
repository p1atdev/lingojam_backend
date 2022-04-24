import "./util/firebase/init"
import { Parser } from "./model/parser"
import { $fetch } from "ohmyfetch"
import { DB } from "./model/db"
import { BBC } from "./model/bbc"

async function main() {
    const bbc = new BBC()

    const bbcEpisodes = await bbc.fetchAllEpisodes()

    const db = new DB()

    const dbEpisodes = await db.getAllEpisodes()

    await Promise.all(
        bbcEpisodes.map(async (ep) => {
            if (dbEpisodes.findIndex((dbEp) => dbEp.title.en === ep.title) === -1) {
                if (!ep.url) {
                    throw new Error("No url")
                }

                try {
                    const episode = await getEpisode("https://www.bbc.co.uk" + ep.url)

                    await db.addEpisode(episode, episode.pid)
                } catch (err) {
                    console.error(err)
                }
            }
        })
    )
}

async function getEpisode(url: string) {
    console.log(url)

    const html = await $fetch(url, {
        responseType: "text",
    })

    const parser = new Parser(html)

    const episode = await parser.parseToEpisode()

    if (!episode) {
        throw new Error("Failed to get episode")
    }

    return episode
}

main()
