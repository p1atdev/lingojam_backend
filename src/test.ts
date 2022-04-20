import "./util/firebase/init"
import { Parser } from "./model/parser"
import { $fetch } from "ohmyfetch"
import puppeteer from "puppeteer"

async function main() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto("https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220413")
    await page.waitForSelector("iframe")
    const html = await page.content()
    await browser.close()

    // const html = await $fetch("https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/ep-220413", {
    //     responseType: "text",
    // })

    console.log(html)

    const parser = new Parser(html)

    const episode = await parser.parseToEpisode()

    console.dir(episode, { depth: null })
}

main()
