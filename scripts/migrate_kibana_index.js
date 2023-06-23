const { Client } = require('@elastic/elasticsearch');
const https = require('https');

// Elasticsearch configuration, disable TLS verification since we most likely
// use self-signed certificates
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

// Elasticsearch client
const client = new Client(config);

// we use this index to collect all SO of all indices
const TARGET_INDEX = 'tmp-migration-index';
const KIBANA_INDEX_NAME = ".kibana"

// Helper function to check if an index exists
async function indexExists(index) {
  const response =  await client.indices.exists({ index });
  return response;
}

// delete the tmp index if it exists
async function deleteTmpSavedObjectsIndex() {
  const indexExistsResult = await indexExists(TARGET_INDEX);
  if (indexExistsResult) {
    await client.indices.delete({ index: TARGET_INDEX });
  }
}

// Create a temporary index which we use to collect all SO from all indices
// We also need to copy the mapping from the .kibana index to this tmp index
async function createTmpSavedObjectsIndex() {

  // Get mapping from the source index, we need to apply it to the target index
  const mappingResponse = await client.indices.getMapping({
    index: KIBANA_INDEX_NAME,
  });

  // we expect mappings from exactly one index here, i.e. fron the .kibana index
  // We have multiple aliases, but they all point to one index
  const keys = Object.keys(mappingResponse)
  if (keys.length != 1) {
    console.log("Expected exactly one index for the mappings, but got: " + keys);
    return;
  }

  const sourceMapping = mappingResponse[keys[0]].mappings;
  console.log("Creating index " + TARGET_INDEX);

  // Create the target index with the mapping from the source index
  await client.indices.create({
    index: TARGET_INDEX,
    body: {
      mappings: sourceMapping,
    },
  });
}

async function setupTmpMigrationIndex() {
  try {

    // we expect that we have exactly one concrete index for our source index
    const aliasResponse = await client.indices.getAlias({name: KIBANA_INDEX_NAME});

    // we expect mappings from exactly one concrete index for the alias
    const keys = Object.keys(aliasResponse)

    if (keys.length != 1) {
      console.log("Expected exactly one index for alias, but got: " + keys);
      return;
    }

    const concreteIndex = keys[0];

    // Check if the target index exists so we can decide what to do next
    const indexExistsResult = await indexExists(TARGET_INDEX);

    // var 1 - recreate the index every time
    // makes it possible to run this script multiple times
    await deleteTmpSavedObjectsIndex();
    await createTmpSavedObjectsIndex();

    // var 2 - only create if it does not exists. IRL we would choose var2 because
    // in the end we will loop over all tenant indices and write all objects to
    // this index.
//    if (!indexExistsResult) {
//      // Create the target index if it doesn't exist
//      await createTmpSavedObjectsIndex();
//    }
  } catch (error) {
    console.error('Error while setting up tmp index with mapping from source index:', error);
  }
}

async function fetchModifyAndIndexSavedObjects(sourceIndex, tenantName) {
  try {

    const response = await client.search({
      index: sourceIndex,
      scroll: '30s',
      size: 1000,
      _source: true,
    });

    // console.log(response);

    // Process each document
    for (const hit of response.hits.hits) {
      const {_id, _source} = hit;

      // Check if the document has the 'namespaces' field of type Array
      if (Array.isArray(_source.namespaces) && tenantName !== undefined) {
        // Add the tenant name to the 'namespaces' field.
        console.debug("Adding " + tenantName + " to saved object with id " + _id);
        _source.namespaces.push(tenantName);
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
  } catch (error) {
    console.error('Error while migrating saved objects from source index ' + sourceIndex , error);
  }
}

async function recreateSavedObjectsIndex() {

  try {

    // delete everything in the index and reindex our modified stuff.
    // deleting the index would also delete the alias structure
    await client.deleteByQuery({
      index: KIBANA_INDEX_NAME,
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
        dest: { index: KIBANA_INDEX_NAME },
      }
    );

    // let's see how we did
    console.log(reindexResponse);
  } catch (error) {
    console.error('Error while reindexing documents from ' + TARGET_INDEX + " to " + KIBANA_INDEX_NAME, error);
  }
}

// Main function: Read the SO from a source index, add an arbitrary value to the namespaces field
// of all top level documents and index each document in a target index. When all objects are consumed, modified and written,
// empty the original index and reindex the target index to the original index. This is done to be sure to **only**
// fiddle around with the actual concrete index, but leave any alias structures intact.
async function fetchAndModifyDocuments(source_index, deleteTargetIndex) {
  try {

    await setupTmpMigrationIndex();

    // here we need to loop over all tenant indices
    await fetchModifyAndIndexSavedObjects(".kibana", "global");
    await fetchModifyAndIndexSavedObjects(".kibana_-152937574_admintenant", "admintenant");
    await fetchModifyAndIndexSavedObjects(".kibana_92668751_admin", "admin");

    await recreateSavedObjectsIndex();

  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to fetch and modify documents
fetchAndModifyDocuments();
