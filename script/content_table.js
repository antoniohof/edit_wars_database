var fs = require('fs'); 
const { parse } = require("csv-parse");
var path = require('path')
const csv=require('csvtojson');
const { resolve } = require('path');
const uuid = require('uuid');

const utils = require('./utils')

const contentPath = 'data/content_table/content_table.csv'


const contentExportPath = 'export/content/'

const narratives = ['', 'freezing-europe','protecting-russian-world','mythical-nazis', 'cold-war-ii']


const readContentFile = () => {
  return csv({delimiter: ','}).fromFile(contentPath)
}

const getContent = () => {
  return new Promise((resolve, reject) => {
    readContentFile().then((contents)=>{
      var contentData = {"steps": [], "backgrounds": []}
      contents.forEach(content => {
        //step
        const narrativeId = narratives.indexOf(content.narrative)
        // create narrative folder if it doesnt exist
        const narrativeFolder = contentExportPath + narrativeId
        if (narrativeId > 0 && !fs.existsSync(narrativeFolder)) {
          fs.mkdirSync(narrativeFolder);
          fs.mkdirSync(`${narrativeFolder}/steps`);
          fs.mkdirSync(`${narrativeFolder}/backgrounds`);
        }
        const stepName = `${content.narrative}-${parseInt(content.step_idx)}-${content.text_component}`
        const stepData = {
          narrative: narrativeId,
          path: `${narrativeFolder}/steps/${stepName}.json`,
          narrativeName: content.narrative,
          order: parseInt(content.step_idx),
          component: content.text_component,
          body_en: content.body_en,
          body_ru: content.body_ru,
          name: `${content.narrative}-${parseInt(content.step_idx)}-${content.text_component}`,
          uuid: uuid.v1()
        }
        contentData.steps.push(stepData)
        //saveStepData(stepData, narrativeFolder)

        // check if background is there 
        if (content.identifier.length > 0) {
          const backgroundData = {
            narrative: narrativeId,
            narrativeName: content.narrative,
            path: `${narrativeFolder}/backgrounds/${content.identifier}.json`,
            identifier: content.identifier,
            order: parseInt(content.bg_idx),
            component: content.graph_component,
            keywords: content.keywords,
            steps: content.steps,
            data: content.data,
            events: content.events,
            headlines: content.headlines,
            uuid: uuid.v1()
          }
          contentData.backgrounds.push(backgroundData)
          //saveBackgroundData(backgroundData, narrativeFolder)
        }
      })
      resolve(contentData)
    })
  })
}

exports.getContent = getContent

/*

getContent().then((data) => {
  console.log("data", data)
})

background data

{
  "body_ru": "**Propaganda** narratives and myths about sanctions in Russian-language media.",
  "body_en": "**Propaganda** narratives and myths about sanctions in Russian-language media.",
  "identifier": "1-Step 1",
  "name": "Step 1",
  "order": 1,
  "date": "2022-10-06T14:05:48.612Z",
  "narrative": 1,
  "uuid": "H9IcNQk_lXWq5DGjikhY4",
  "component": "TextCenter"
}

step data
{
  "narrative": 1,
  "stepstart": 1,
  "stepend": 1,
  "identifier": "[Start:1][End:1]-freezing_europe",
  "uuid": "DZwrzYnDtBDqw9oqBnGOt",
  "name": "freezing_europe",
  "component": "WordCloud"
}
*/
