import { Parser } from "./model/parser"
import { $fetch } from "ohmyfetch"
import { BBC } from "./model/bbc"

const shipURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220427"
const robotURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-230420"
const charlotteURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220413"

async function main() {
    const bbc = new BBC()

    const bbcEpisodes = await bbc.fetchAllEpisodes()

    // console.log(bbcEpisodes)

    const html = await $fetch(shipURL, {
        responseType: "text",
    })

    const parser = new Parser(html)

    // const episode = await parser.parseToEpisode(bbcEpisodes[0].thumbnailUrl)
    const episode = await parser.parseToEpisode(bbcEpisodes[0].thumbnailUrl)

    console.dir(episode, { depth: null })
}

main()
