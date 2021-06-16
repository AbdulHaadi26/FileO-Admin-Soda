module.exports = {

    createDPlan: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc && doc.key) return doc.key;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateDPlan: async (_id, name, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Plan not found');

            let plan = doc.getContent();
            plan.name = name;

            await collection.find().fetchArraySize(0).key(_id).replaceOne(plan);

            return plan;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllDPlanLimit: async (_id, date, collection) => {
        try {
            let document = await collection.find().filter({ postedby: _id, date: date }).getOne();
            if (!document) return false;
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllDPlanLimitAll: async (_id, month, year, collection) => {
        try {
            let plans = [];
            let dateR = new Date(Date.now()), dateL = new Date(Date.now());
            
            dateR.setFullYear(year);
            dateL.setFullYear(year);

            dateR.setMonth(month);
            dateL.setMonth(month);

            dateR.setHours(0, 0, 0, 0);
            dateL.setHours(0, 0, 0, 0);

            dateR.setDate(31);
            dateR.addHours(24 * 7);

            dateL.setDate(0);
            dateL.addHours(-24 * 7);


            let doc = await collection.find().filter({ postedby: _id, time_due: { $lte: dateR, $gte: dateL } }).getDocuments();

            if (doc) {
                doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    plans.push(tempDoc);
                });
            }
            return plans;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    findDPlanByName: async (_id, date, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ postedby: _id, date: date }).getOne();
            if (doc) {
                let tempDoc = doc.getContent();
                tempDoc._id = doc.key;
                return tempDoc;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteDPlan: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteDPlanUser: async (_id, collection) => {
        try {
            await collection.find().filter({ postedby: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}