import { Parser } from "./model/parser"
import { $fetch } from "ohmyfetch"
import { BBC } from "./model/bbc"
import { textSpanContainsTextSpan } from "typescript"

const shipURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220427"
const robotURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-230420"
const charlotteURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220413"

async function main() {
    const bbc = new BBC()

    const bbcEpisodes = await bbc
        .fetchAllEpisodes()
        .then((episodes) => episodes.filter((episode) => episode.title?.includes("Robotic surgery")))

    console.log(bbcEpisodes)

    const successList = await Promise.all(
        bbcEpisodes.map(async (ep) => {
            if (!ep.url) {
                return
            }

            console.log(ep.url)

            const html = await $fetch("https://www.bbc.co.uk" + ep.url, {
                responseType: "text",
            })

            const parser = new Parser(html)

            // const episode = await parser.parseToEpisode(bbcEpisodes[0].thumbnailUrl)
            const episode = await parser.parseToEpisode(ep.thumbnailUrl)

            // console.dir(episode?.title, { depth: null })
            return episode
        })
    )

    console.log(
        "successList",
        successList.map((ep) => {
            return {
                title: ep?.title.en,
                thumbnail: ep?.thumbnailUrl,
            }
        })
    )

    const failedList = bbcEpisodes
        .filter((ep) => {
            return ep.title !== null && ep.title !== undefined
        })
        .filter((ep) => {
            return !successList.map((s) => s?.title.en).includes(ep.title!)
        })

    console.log("failedList", failedList)
}

main()
