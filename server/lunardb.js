const { LunarDB, QueryBuilders } = require('lunardb-js');
const Update = require('lunardb-js/src/query-builders/Update');
const { Database, Schema, Create, Insert, Select } = QueryBuilders;

let lunardb = undefined;

const AstroDB_Config = {
  databaseName: 'AstroHuddle',
  schemaName: 'HuddleConvo',
  collectionName: 'HuddleConvos',
};

const setupLunarDB = () => {
  lunardb = new LunarDB('127.0.0.1', 8083);

  lunardb.connect();

  const onDatabaseConnect = () => {
    console.log('[INFO-DB] Connected to database');

    // setup database
    lunardb
      .query(new Database().name(AstroDB_Config.databaseName).isCreate())
      .then(result => {
        console.log(`[INFO-DB] ${result}`);

        return lunardb.query(new Database().name(AstroDB_Config.databaseName).isUse());
      })
      .then(result => {
        console.log(`[INFO-DB] ${result}`);

        return lunardb.query(
          new Schema()
            .name(AstroDB_Config.schemaName)
            .addField({ name: 'history', type: 'string' })
            .addField({ name: 'huddle', type: 'string' })
        );
      })
      .then(result => {
        console.log(`[INFO-DB] ${result}`);

        return lunardb.query(
          new Create().name(AstroDB_Config.collectionName).schema(AstroDB_Config.schemaName).isDocument()
        );
      })
      .then(result => {
        console.log(`[INFO-DB] ${result}`);
      })
      .catch(err => {
        console.error(`[ERROR-DB] ${err}`);
      });

    lunardb.removeOnConnectListener(onDatabaseConnect);
  };

  lunardb.addOnConnectListener(onDatabaseConnect);

  return lunardb;
};

const insertHuddleIntoDB = (huddle, history, afterInsertedCallback) => {
  lunardb
    .query(
      new Insert().into(AstroDB_Config.collectionName).addObject({ huddle, history: `%%${JSON.stringify(history)}%%` })
    )
    .then(queryResult => {
      console.log(`[INFO-DB] On inserting huddle ${huddle} -> ${queryResult}`);

      afterInsertedCallback();
    })
    .catch(err => {
      console.error(`[ERROR-DB] ${err}`);
    });
};

const loadHuddleFromDB = (huddle, huddlesDataCallback) => {
  lunardb
    .query(
      new Select().from(AstroDB_Config.collectionName).addField('_rid').addField('history').where(`huddle == ${huddle}`)
    )
    .then(queryResult => {
      huddlesDataCallback(JSON.parse(queryResult.replace(/%%/g, '')).selection);
    })
    .catch(err => {
      console.log(`[ERROR-DB] ${err}`);
    });
};
const updatingHuddleIDs = new Set();

const updateHuddleHistoryDB = async (huddleID, history) => {
  if (history.length === 0) {
    console.log(`[STORAGE-DB] Not saving empty huddle(${huddleID})`);
    return;
  }
  if (updatingHuddleIDs.has(huddleID)) {
    console.log(`[STORAGE-DB] Already saving huddle(${huddleID})`);
    return;
  }

  console.log(`[STORAGE-DB] Saving huddle(${huddleID}) history (${history.length} entries)`);

  updatingHuddleIDs.add(huddleID);

  lunardb
    .query(
      new Update()
        .collection(AstroDB_Config.collectionName)
        .where(`_rid == ${huddleID}`)
        .addModify({ field: 'history', expression: `%%${JSON.stringify(history)}%%` })
    )
    .then(result => {
      console.log(`[STORAGE-DB] On saving ${huddleID} -> ${result}`);
      updatingHuddleIDs.delete(huddleID);
    })
    .catch(err => {
      console.error(`[ERROR-DB] ${err}`);
    });
};

module.exports = {
  setupLunarDB,
  updateHuddleHistoryDB,
  insertHuddleIntoDB,
  loadHuddleFromDB,
  AstroDB_Config,
  Select,
  Insert,
};
