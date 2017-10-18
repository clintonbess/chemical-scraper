/* eslint-disable flowtype/require-valid-file-annotation, no-console, unicorn/no-process-exit */
import jsonCsv from 'json2csv'
import Promise from 'bluebird'
import X from 'x-ray'
import fs from 'fs'
import request from 'request'
import R from 'ramda'

const xray = X()

function urlFromPageNumber (page_num) {
  return `https://echa.europa.eu/information-on-chemicals/cl-inventory-database?p_p_id=dissclinventory_WAR_dissclinventoryportlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&p_p_col_id=column-1&p_p_col_pos=1&p_p_col_count=2&_dissclinventory_WAR_dissclinventoryportlet_jspPage=%2Fhtml%2Fsearch%2Fsearch.jsp&_dissclinventory_WAR_dissclinventoryportlet_searching=true&_dissclinventory_WAR_dissclinventoryportlet_iterating=true&_dissclinventory_WAR_dissclinventoryportlet_criteriaParam=_dissclinventory_WAR_dissclinventoryportlet_criteriaKeyXY1a&_dissclinventory_WAR_dissclinventoryportlet_delta=200&_dissclinventory_WAR_dissclinventoryportlet_orderByCol=&_dissclinventory_WAR_dissclinventoryportlet_orderByType=asc&_dissclinventory_WAR_dissclinventoryportlet_resetCur=false&_dissclinventory_WAR_dissclinventoryportlet_cur=${page_num}`
}

function getHtmlFromUrl (url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, ignored_response, body) => {
      err ? reject(err) : resolve(body)
    })
  })
}

function getSubstanceTableRows (html) {
  const options = [{
    name: 'td.table-cell.first a',
    link: 'td.table-cell.first a@href',
    other_cells: ['td.table-cell.first ~ td'],
  }]
  return new Promise((resolve, reject) => {
    xray(html, 'tbody.table-data tr', options)((err, results) => {
      if (err) {
        reject(err)
      } else {
        let substance_data = []
        if (results.length > 0) {
          const substance_rows = results.reverse()
          const [ ignored_row, ...rest ] = substance_rows
          substance_data = rest
        }
        resolve(substance_data)
      }
    })
  })
}

function parseSubstanceRow ({name, link, other_cells}) {
  const [ec_num, cas_num, index_num] = other_cells
  return {
    name,
    link,
    ec_num,
    cas_num,
    index_num,
  }
}

function scrapePage (page_num) {
  const url = urlFromPageNumber(page_num)
  console.log(`scraping page number: ${page_num}`)
  return getHtmlFromUrl(url)
    .then(getSubstanceTableRows)
    .map(parseSubstanceRow)
}

function scrapePages (number_of_pages) {
  const page_nums = Array.apply(null, {length: number_of_pages}).map((ignored_value, index) =>
    index + 1
  )
  return Promise.map(page_nums, scrapePage, {concurrency: 3})
}

function trimFields (substance) {
  return Object.keys(substance).reduce((acc, key) => {
    acc[key] = substance[key].trim()
    return acc
  }, {})
}

function sortByName (substance_rows) {
  return substance_rows.sort((sub_1, sub_2) => {
    if (sub_1.name < sub_2.name) { return -1 }
    if (sub_1.name > sub_2.name) { return 1 }
    return 0
  })
}

function writeCsv (substance_rows) {
  const normalize = R.pipe(
    R.map(trimFields),
    sortByName
  )
  return new Promise((resolve, reject) => {
    const fields = [
      'name',
      'ec_num',
      'cas_num',
      'index_num',
      'link',
    ]

    const csv = jsonCsv({ data: normalize(substance_rows), fields: fields })

    fs.writeFile(`./chemicals.csv`, csv, (err) => {
      err ? reject(err) : resolve()
    })
  })
}

scrapePages(623)
  .then(R.flatten)
  .then(writeCsv)
  .catch(console.error)
