import { $fetch } from "ohmyfetch"
import { JSDOM } from "jsdom"

const lingohackUrl = "https://www.bbc.co.uk/learningenglish/english/features/lingohack_2022/"

export class BBC {
    async fetchAllEpisodes() {
        const html = await $fetch(lingohackUrl)

        const doc = new JSDOM(html).window.document

        const heroEl = doc.querySelector(
            "div.widget.widget-bbcle-coursecontentlist.widget-bbcle-coursecontentlist-featured.widget-progress-enabled"
        )

        const heroEpisode = {
            title: heroEl?.querySelector("h2 a")?.textContent,
            url: heroEl?.querySelector("h2 a")?.getAttribute("href"),
        }

        const listEls = doc.querySelectorAll("li.course-content-item.active")

        const episodes = Array.from(listEls).map((el) => {
            const title = el.querySelector("h2 a")?.textContent
            const url = el.querySelector("h2 a")?.getAttribute("href")

            return {
                title,
                url,
            }
        })

        return [heroEpisode, ...episodes]
    }
}
