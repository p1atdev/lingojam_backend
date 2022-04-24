import "./util/firebase/init"
import { Parser } from "./model/parser"
import { $fetch } from "ohmyfetch"

const robotURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-230420"
const charlotteURL = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220413"

async function main() {
    const html = await $fetch(robotURL, {
        responseType: "text",
    })

    const parser = new Parser(html)

    const episode = await parser.parseToEpisode()

    console.dir(episode, { depth: null })
}

main()
