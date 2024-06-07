import { LunarDB, QueryBuilders } from 'lunardb-js';
const { Database, Schema, Create, Insert, Select, Update } = QueryBuilders;

import { Logger, LogLevel } from './Logger.js';

let lunardb = undefined;

const AstroDB_Config = {
  databaseName: 'AstroHuddle',
  schemaName: 'HuddleConvo',
  collectionName: 'HuddleConvos',
};

const setupLunarDB = () => {
  Logger.info('Setting up connection on ws://127.0.0.1:8083');
  lunardb = new LunarDB('127.0.0.1', 8083);

  lunardb.connect();

  const onDatabaseConnect = () => {
    Logger.info('Connected to LunarDB');

    // setup database
    lunardb
      .query(new Database().name(AstroDB_Config.databaseName).isCreate())
      .then(result => {
        Logger.database(result);

        return lunardb.query(new Database().name(AstroDB_Config.databaseName).isUse());
      })
      .then(result => {
        Logger.database(result);

        return lunardb.query(
          new Schema()
            .name(AstroDB_Config.schemaName)
            .addField({ name: 'history', type: 'string' })
            .addField({ name: 'huddle', type: 'string' })
        );
      })
      .then(result => {
        Logger.database(result);

        return lunardb.query(
          new Create().name(AstroDB_Config.collectionName).schema(AstroDB_Config.schemaName).isDocument()
        );
      })
      .then(result => {
        Logger.database(result);
      })
      .catch(err => {
        Logger.database(`[ERROR] ${err}`);
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
      Logger.database(`Huddle(${huddle}) insert result: ${queryResult}`);

      afterInsertedCallback();
    })
    .catch(err => {
      Logger.database(`[ERROR] ${err}`);
    });
};

const loadHuddleFromDB = (huddle, huddlesDataCallback) => {
  lunardb
    .query(
      new Select().from(AstroDB_Config.collectionName).addField('_rid').addField('history').where(`huddle == ${huddle}`)
    )
    .then(queryResult => {
      const selection = JSON.parse(queryResult.replace(/%%/g, '')).selection;
      Logger.database(`Loadded huddle ${huddle}, ${selection.length} messages`);
      huddlesDataCallback(selection);
    })
    .catch(err => {
      Logger.database(`[ERROR] ${err}`);
    });
};
const updatingHuddleIDs = new Set();

const updateHuddleHistoryDB = async (huddleID, history) => {
  if (history.length === 0) {
    Logger.info(`HuddleID(${huddleID}) -> Has empty history, not saving`);
    return;
  }

  if (updatingHuddleIDs.has(huddleID)) {
    Logger.info(`HuddleID(${huddleID}) -> Already under saving process`);
    return;
  }

  Logger.info(`HuddleID(${huddleID}) -> Saving process started, ${history.length} messages on going`);

  updatingHuddleIDs.add(huddleID);

  lunardb
    .query(
      new Update()
        .collection(AstroDB_Config.collectionName)
        .where(`_rid == ${huddleID}`)
        .addModify({ field: 'history', expression: `%%${JSON.stringify(history)}%%` })
    )
    .then(result => {
      Logger.database(`Update HuddleID(${huddleID}) query result: ${result}`);
      updatingHuddleIDs.delete(huddleID);
    })
    .catch(err => {
      Logger.database(`[ERROR] ${err}`);
    });
};

export { setupLunarDB, updateHuddleHistoryDB, insertHuddleIntoDB, loadHuddleFromDB, Select, Insert };
