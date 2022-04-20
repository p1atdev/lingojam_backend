export const getSentence = (elements: Element[], after: string) => {
    const sentence = elements.find((e) => e.textContent == after)
    if (!sentence) {
        console.log(`No sentence: ${after}`)
        return
    }
    return sentence.nextElementSibling
}

export const getSentences = (elements: Element[], after: string, before: string) => {
    const startIndex = elements.findIndex((e) => e.textContent == after)
    if (startIndex == -1) {
        console.log(`No sentence: ${after}`)
        return
    }
    const endIndex = elements.findIndex((e) => e.textContent == before)
    if (endIndex == -1) {
        console.log(`No sentence: ${before}`)
        return
    }
    return elements.slice(startIndex + 2, endIndex)
}
