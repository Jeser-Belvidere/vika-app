const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const rows = []

const headers = {
    id: 'id',
    bloger: 'Блогер',
    url: 'url',
    name: 'Наименование товара',
    atricul: 'Артикул',
    trand: 'ТРЕНД ТЗ',
    date: 'Дата рекламы',
    placemarkets: 'Площадки',
    lastView: 'Последний замер просмотров',
    socialMedia: "Соц. сеть"
}

const YOUTUBE = 'youtube'
const INSTAGRAM = 'instagram'
const TIKTOK = 'tiktok'
const OTHER = 'other'


const importFiles = (productsResult, fileName, deleteInitData = false) => {

    if (deleteInitData) {
        Object.keys(productsResult).forEach(key => {
            if (key !== 'totalViews') {
                delete productsResult[key].initData
            }
        })
    }

    const stringyfiedJson = JSON.stringify(productsResult)

    try {
        fs.writeFileSync(`./results/${fileName}.txt`, stringyfiedJson);
        fs.writeFileSync(`./results/${fileName}.json`, stringyfiedJson);
    } catch (err) {
        console.error(err);
    }
}

const sortVideosByViews = (preparedResults, minViewsCount = 2000) => {
    const copyResult = JSON.parse(JSON.stringify(preparedResults))
    delete copyResult.totalVideos
    Object.keys(copyResult).forEach(key => {

        copyResult[key].sortedVideos = copyResult[key].initData.filter(video => video[headers.lastView] > minViewsCount).sort((a, b) => b[headers.lastView] - a[headers.lastView])
        delete copyResult[key].initData

        if (copyResult[key].sortedVideos.length === 0) {
            delete copyResult[key]
        }

    })

    importFiles(copyResult, 'filteredByViews')
}

const prepareRow = (row) => {
    if (row[headers.url].includes(YOUTUBE)) {
        row[headers.url] = YOUTUBE
    }else if (row[headers.url].includes(INSTAGRAM)) {
        row[headers.url] = INSTAGRAM
    }else if (row[headers.url].includes(TIKTOK)) {
        row[headers.url] = TIKTOK
    } else {
        row[headers.url] = OTHER
    }
    return row
}

const onParsedCsv = () => {
    rows.map(row => {
        return prepareRow(row)
    })

    const productsResult = {
        totalVideos: 0
    }

    rows.forEach(row => {
        if (!productsResult[row[headers.name]]) {
            productsResult[row[headers.name]] = {
                initData: [],
                instagram: {
                    views: 0,
                    videos: 0
                },
                tiktok: {
                    views: 0,
                    videos: 0
                },
                youtube: {
                    views: 0,
                    videos: 0
                },
                other: {
                    views: 0,
                    videos: 0
                },
                trands: new Set()
            }
        }

        productsResult[row[headers.name]].initData.push(row)

        productsResult[row[headers.name]].trands.add(row[headers.trand])
        productsResult.totalVideos += 1

        if (row[headers.url] === YOUTUBE) {
            productsResult[row[headers.name]].youtube.views += Number(row[headers.lastView])
            productsResult[row[headers.name]].youtube.videos += 1

        }

        if (row[headers.url] === INSTAGRAM) {
            productsResult[row[headers.name]].instagram.views += Number(row[headers.lastView])
            productsResult[row[headers.name]].instagram.videos += 1
        }

        if (row[headers.url] === TIKTOK) {
            productsResult[row[headers.name]].tiktok.views += Number(row[headers.lastView])
            productsResult[row[headers.name]].tiktok.videos += 1
        }
        if (row[headers.url] === OTHER) {
            productsResult[row[headers.name]].other.views += Number(row[headers.lastView])
            productsResult[row[headers.name]].other.videos += 1
        }
    })


    Object.keys(productsResult).forEach(key => {
        if (key != 'totalVideos') {
            productsResult[key].trands = [...productsResult[key].trands]
        }
    })

    sortVideosByViews(productsResult)

    importFiles(productsResult, 'result', true)
}

fs.createReadStream(path.resolve(__dirname, 'csv.csv'))
    .pipe(csv.parse({ headers: true, delimiter: ',' }))
    .on('error', error => console.error(error))
    .on('data', row => rows.push(row))
    .on('end', rowCount => {
        onParsedCsv()
        console.log(`Parsed ${rowCount} rows`)
    });
