const { Client } = require('@elastic/elasticsearch');
const https = require('https');

// Elasticsearch configuration
const config = {
  node: 'https://localhost:9200',
  auth: {
    username: 'admin',
    password: 'admin',
  },
  tls: {
    rejectUnauthorized: false,
    agent: new https.Agent({
      rejectUnauthorized: false,
    }),
  },
};

const NEW_NAMESPACE = 'new-namespace-entry'; // this will become the tenant name in the final version
const TARGET_INDEX = 'tmp-migration-index';

// Create Elasticsearch client
const client = new Client(config);

// Function to check if an index exists
async function indexExists(index) {
  const response =  await client.indices.exists({ index });
  return response;
}

// create an index if it doesn't exist
async function createIndex(index, sourceIndex) {

  // Get mapping from the source index, we need to apply it to the target index
  const mappingResponse = await client.indices.getMapping({
    index: sourceIndex,
  });

  // we expect mappings from exactly one index here. We have multiple aliases, but they all point to one index
  const keys = Object.keys(mappingResponse)
  if (keys.length != 1) {
    console.log("Expected exactly one index for the mappings, but got: " + keys);
    return;
  }

  const sourceMapping = mappingResponse[keys[0]].mappings;
  console.log("Creating index " + index);

  // Create the target index with the mapping from the source index
  await client.indices.create({
    index,
    body: {
      mappings: sourceMapping,
    },
  });
}

// delete the index if it exists
async function deleteIndex(index) {
  const indexExistsResult = await indexExists(index);
  if (indexExistsResult) {
    await client.indices.delete({ index });
  }
}

// Main function: Read the SO from a source index, add an arbitrary value to the namespaces field
// of all top level documents and index each document in a target index. When all objects are consumed, modified and written,
// empty the original index and reindex the target index to the original index. This is done to be sure to **only**
// fiddle around with the actual concrete index, but leave any alias structures intact.
async function fetchAndModifyDocuments(source_index, deleteTargetIndex) {
  try {

    // we expect that we have exactly one concrete index for our source index
    const aliasResponse = await client.indices.getAlias({ name: source_index });

    // we expect mappings from exactly one concrete index for the alias
    const keys = Object.keys(aliasResponse)

    if (keys.length != 1) {
      console.log("Expected exactly one index for alias, but got: " + keys);
      return;
    }

    const concreteIndex = keys[0];

    // Check if the target index exists so we can decide what to do next
    const indexExistsResult = await indexExists(TARGET_INDEX);

    // var 1 - recreate the index every time, useful when debugging
    if (deleteTargetIndex) {
      await deleteIndex(TARGET_INDEX);
      await createIndex(TARGET_INDEX, source_index);
    }

    // var 2 - only create if it does not exists. IRL we would choose var2 because
    // in the end we will loop over all tenant indices and write all objects to
    // this index.
//    if (!indexExistsResult) {
//      // Create the target index if it doesn't exist
//      await createIndex(TARGET_INDEX);
//    }

    const response = await client.search({
      index: source_index,
      scroll: '30s',
      size: 1000,
      _source: true,
    });

    // console.log(response);

    // Process each document
    for (const hit of response.hits.hits) {
      const { _id, _source } = hit;

      // Check if the document has the 'namespaces' field of type Array
      if (Array.isArray(_source.namespaces)) {
        // Add the constant value to the 'namespaces' field. This will become
        // the tenant name once we loop over all tenant indices
        _source.namespaces.push(NEW_NAMESPACE);
      }

      // Add the modified document to the target index
     indexResponse = await client.index({
       index: TARGET_INDEX,
       id: _id,
       body: _source,
       refresh: true, // TODO: Is this needed?
     });

    }

    // Clear the scroll (maybe scroll is not needed altogether?)
    await client.clearScroll({
      scroll_id: response._scroll_id,
    });

    // Without flushing the target index, the following reindex step
    // may not see all documents since they have not been written to disk
    const flushResult = await client.indices.flush({
      index: TARGET_INDEX
    });

    // delete everything in the index and reindex our modified stuff.
    // deleting the index would also delete the alias structure
    await client.deleteByQuery({
      index: concreteIndex,
      wait_for_completion: true,
      refresh: true,
      body: {
        query: {
          match_all: {},
        },
      },
    });

    // Reindex to our existing kibana index
    const reindexResponse = await client.reindex({
      wait_for_completion: true,
      refresh: true,
      source: { index: TARGET_INDEX },
      dest: { index: concreteIndex },
      }
    );

    // let's see how we did
    console.log(reindexResponse);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to fetch and modify documents
fetchAndModifyDocuments(".kibana", true);
