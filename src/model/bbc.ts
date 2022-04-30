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
            thumbnailUrl: (() => {
                const srcset = heroEl?.querySelector("div.img a img")?.getAttribute("srcset")
                if (!srcset) {
                    throw new Error("No srcset")
                }
                const srcs = srcset.split(",").map((src) => src.split(" ")[0])
                const src = srcs[srcs.length - 1]
                return src
            })(),
        }

        const listEls = doc.querySelectorAll("li.course-content-item.active")

        const episodes = Array.from(listEls).map((el) => {
            const title = el.querySelector("div.text h2 a")?.textContent
            const url = el.querySelector("div.text h2 a")?.getAttribute("href")
            const thumbnailUrl = (() => {
                const srcset = el.querySelector("div.img a img")?.getAttribute("srcset")
                if (!srcset) {
                    throw new Error(`No srcset: ${title}`)
                }
                const srcs = srcset.split(",").map((src) => src.split(" ")[0])
                const src = srcs[srcs.length - 1]
                return src
            })()

            return {
                title,
                url,
                thumbnailUrl,
            }
        })

        return [heroEpisode, ...episodes]
    }
}
