var fs = require('fs'); 
const { parse } = require("csv-parse");
var path = require('path')

const csv=require('csvtojson')
const dataFolder = 'data/WordCloud/';
const outputFolder = 'export/narratives_word_graphs/'

const path_full_connections_data = 'data/full_connections_data/full_data.csv'
const path_narratives_keywords = 'data/narratives_keywords.json'

var mergedNodes = []
var mergedLinks = []
var mergedConnections = {}

var files_length = 0
var saved_file_index = 0


const readFullData = () => {
  readCsvFile(path_full_connections_data)
}

const readNarrativeKeywords = () => {
  var rawdata = fs.readFileSync(path_narratives_keywords);
  return JSON.parse(rawdata)
}

const readCsvFile = (filename) => {
  return csv({delimiter: ','})
  .fromFile(filename)
  .then((jsonObj)=>{
    const narrativeKeywords = readNarrativeKeywords()
    narrativeKeywords.map(n => {n})
    
    //console.log("jsonObj", jsonObj)

    var mergedConnectionData = {} 
    narrativeKeywords.map(narrative => {
      var nodes = []
      var links = []
      mergedConnectionData = collectNarrativeNodes(mergedNodes, mergedLinks, narrative, jsonObj)
      var narrativeConnectionData = collectNarrativeNodes(nodes, links, narrative, jsonObj)
      if (mergedConnectionData) {
        saveJsonFile(`${outputFolder}${narrative.id}.json`, narrativeConnectionData)
      }
    })
    saveJsonFile(`${outputFolder}mergedNarrativesConnections.json`, mergedConnectionData)

    //console.log("connectionsObj", connectionsObj)
  })
}

const collectNarrativeNodes = (nodes, links, narrative, jsonObj) => {
  var keywords = narrative["keywords"]
  if (keywords.length > 0 ) {
    
    jsonObj.map(obj => {
      // check for each keyword
      keywords.map((keyword, index) => {
        let regex = new RegExp(keyword, 'g');
        if (parseInt(obj["count"]) < 10) return false
        if (regex.exec(obj["source"]) || regex.exec(obj["target"])) {
          links.push(obj)
          mergedLinks.push(obj)
          // only give count to the header 
          var existing_node = nodes.find(n => n.id == obj["source"])
          if (!existing_node) {
            nodes.push({
              "id": obj["source"],
              "en": obj["source_en"],
              "group": index, // if is keyword, group 1, if not group 0
              "value": parseInt(obj["count"]),
              "keyword": keyword
            })
          } else {
            // add count to node if it already exists
            existing_node.value += parseInt(obj["count"])
          }

          existing_node = nodes.find(n => n.id == obj["target"])
          if (!nodes.some(n => n.id == obj["target"])) {
            nodes.push({
              "id": obj["target"],
              "en": obj["target_ru"],
              "group": index, // if is keyword, group 1, if not group 0
              "value": parseInt(obj["count"]),
              "keyword": keyword
            })
          } else {
            // add count to node if it already exists
            existing_node.value += parseInt(obj["count"])
          }
        }
      })
    })
    // console.log("nodes", nodes)
    return {
      "nodes": nodes,
      "links": links
    }
  } else {
    return null
  }
}


const saveJsonFile = (path, jsonObj) => {
  fs.writeFileSync(path, JSON.stringify(jsonObj), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    reject()
    return console.log(err);
  }
  console.log(`${path} file has been saved.`);
  })
}

readFullData()


/*

fs.readdir(dataFolder, (err, files) => {
  files_length = files.length
  files.forEach((file ,index) => {
    if (path.extname(file) == '.csv') {
      readCsvFile(file, index)
    }
  });
});


const cleanDataObject = (dataObject) => {
  return dataObject.map(obj => {
    return {
      "source": obj["text"],
      "target": obj["head"],
      "keyword": obj["Regex String (OR)"].replace(/\^|\(|\)/g, ''), // from (всу|обстрел) to всу|обстрел
      "value": parseInt(obj["count"]),
      "source_en": "",
      "target_en": ""
    }
  })
}

const processWordCloud = (dataObject, index) => {

  var nodes = []
  var links = []

  // nodes for local file
  nodes = collectNodes(dataObject, nodes, index)
  
  // all nodes merged
  mergedNodes = collectNodes(dataObject, mergedNodes, index)

  // array of each link
  links = dataObject.map(obj => {
    return {
      "source": obj["source"],
      "target": obj["target"],
      "source_en": "",
      "target_en": ""
    }
  })

  // merged links
  mergedLinks = mergedLinks.concat(links)

  return {
    "nodes": nodes,
    "links": links
  }
}


const saveMergedFile = (path, jsonString) => {

}

const collectNodes = (dataObject, nodes, index) => {
  // collect all sources
  dataObject.map(obj => {
    const re = new RegExp(obj.keyword, 'g');
    nodes.push({
      "id": obj["source"],
      "group": re.exec(obj["source"]) ? index+100+"" : index+"", // if is keyword, group 1, if not group 0
      "value": obj["value"],
      "keyword": obj["keyword"]
    })
  })

  // collect all targets
  dataObject.map(obj => {
    const re = new RegExp(obj.keyword, 'g');
    node = nodes.find(n => n["id"] == obj["target"])
    if (node !== undefined) {
      node["value"] += obj["value"]
    } else {
      nodes.push({
        "id": obj["target"],
        "group": re.exec(obj["target"]) ? index+100+"" : index+"", // if is keyword, group 1, if not group 0
        "value": obj["value"],
        "keyword": obj["keyword"]
      })
    }
  })
  return nodes
}


const uniqueObjectArray = (dataObject) => {
  return dataObject.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.text === value.text 
    ))
  )
}
*/