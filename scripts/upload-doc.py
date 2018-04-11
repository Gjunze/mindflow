#!/usr/bin/env python
import pymongo as pm
from bson import ObjectId
import sys

def get_db():
    return pm.MongoClient()['sails-mongo']
def upload_file(db, docId, fname):
    doc = db.doc.find_one({"_id":ObjectId(docId)})
    storeId = doc['storeId']
    with open(fname, 'rb') as f:
        data = f.read()
        db.store.update({"_id":ObjectId(storeId)}, {"$set":{"data":data}})

if __name__ == '__main__':
    docId = sys.argv[1]
    print 'update docId', docId
    upload_file(get_db(), docId, 'out.json')
        