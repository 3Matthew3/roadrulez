import fs from "fs"
import path from "path"

const dir = "data/countries"
const ids = new Set()

for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json") || file === "index.json") continue
    const json = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
    for (const url of json.header_images ?? []) {
        const match = url.match(/photo-[^?]+/)
        if (match) ids.add(match[0])
    }
}

const ok = []
const bad = []

for (const id of [...ids].sort()) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`
    const res = await fetch(url)
    if (res.ok) ok.push(id)
    else bad.push(`${id} ${res.status}`)
}

console.log(`ok ${ok.length}, bad ${bad.length}`)
console.log("\nBAD:")
bad.forEach((line) => console.log(line))
