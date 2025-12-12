// const {ipcRenderer} = window.require('electron')

import './index.css';
import * as Papa from 'papaparse';
import {onParsedCsv} from './parse'
import '@andypf/json-viewer/dist/iife/index.js'
import {read, utils} from 'xlsx'

const input = document.getElementById('csv-input')

const errorsWidget = document.getElementById('errors-widget')
const errorsTextWrapper = document.getElementById('errors-text-wrapper')
const errorsText = document.getElementById('errors-text')
const errorsButton = document.getElementById('errors-button')
const errorsPopup = document.getElementById('errors-popup')
const downloadCsvBtn = document.getElementById('downloadcsv-btn')

let exelToScvString

const addErrors = ( errors ) => {
  errorsWidget.style.display = 'flex'
  errorsText.innerText = `${errors.length} ошибок при парсинге`
  errors.forEach((error) => {
    const errorItem = document.createElement('div')
    errorItem.className = 'error-item'
    errorItem.innerHTML = `Строка: ${error.row} <br/> Тип: ${error.type} <br/> Сообщение: ${error.message}`
    errorsPopup.appendChild(errorItem)
  })
}


const addVierwer = (resultJson) => {
  const jsonWrapper = document.querySelector('.json-viewer-wrapper')

  const jsonViewer = document.createElement("andypf-json-viewer")
  jsonViewer.id = "json"
  jsonViewer.expanded = 2
  jsonViewer.indent = 6
  jsonViewer.showDataTypes = false
  jsonViewer.theme = "monokai"
  jsonViewer.showToolbar = true
  jsonViewer.showSize = true
  jsonViewer.showCopy = true
  jsonViewer.expandIconType = "square"
  jsonViewer.data = resultJson

  jsonWrapper.appendChild(jsonViewer)

  if (exelToScvString) {
    downloadCsvBtn.style.display = 'block'
  }
}

const parseCSV = (rawString) => {
  const {data, errors, meta} = Papa.parse(rawString, { header: true })
  console.log('data', data)
  console.log('errors', errors)

  const { sortedByViews, result: resultVideos } = onParsedCsv(data)

  const result = {
    'Сортировка по просмотрам': sortedByViews,
    'Все видео': resultVideos
  }

  addVierwer(result)

  if (errors.length) {
    addErrors(errors)
  } else {
    errorsWidget.style.display = 'none'
  }
}

input.addEventListener('change', () => {
  const isExist = document.querySelector('andypf-json-viewer')
  exelToScvString = null
  downloadCsvBtn.style.display = 'none'
  errorsPopup.innerHTML = ''

  if (isExist) {
    isExist.remove()
  }

  const reader = new FileReader()

  if (input.files[0].type === 'text/csv') {
    reader.onload = () => {
      const csvString = reader.result
      parseCSV(csvString)
    };

    reader.readAsText(input.files[0])
  } else {
    const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = new Uint8Array(reader.result);
            const workbook = read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const csv = utils.sheet_to_csv(worksheet);
            exelToScvString = csv
            parseCSV(csv)

          } catch (err) {
            console.error(err);
          }
            

        };
        reader.readAsArrayBuffer(input.files[0]);
  }
});


const downloadCSV = () => {
  const blob = new Blob([exelToScvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'result.csv';
  a.click();
  URL.revokeObjectURL(url);
};
downloadCsvBtn.addEventListener('click', downloadCSV)
errorsButton.addEventListener('click', (e) => {
  if (errorsPopup.style.display === 'block') {
    errorsPopup.style.display = 'none'
  } else {
    errorsPopup.style.display = 'block'
  }
    errorsPopup.style.left = `${e.pageX - 200}px`
    errorsPopup.style.top = `${e.pageY + 20}px`

})