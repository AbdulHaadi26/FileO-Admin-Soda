const { getPresignedUrl } = require('../middlewares/oci-sdk');
const bcrypt = require('bcryptjs');

module.exports = {

    updateVerified: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.verified = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            return docToReplace;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createUser: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Employee could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUserByRoles: async (org, list, collection) => {
        try {
            let arr = [];
            if (list && list.length > 0) {
                let doc = await collection.find().filter({ current_employer: org, roles: { $in: list } }).getDocuments();
                if (doc) doc.map(document => arr.push(document.key));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserByCredentials: async (email, password, collection, collectionOrg) => {
        try {
            const docU = await collection.find().fetchArraySize(0).filter({ email: email, active: true }).getOne();
            if (!docU || !docU.key) throw new Error('User with this email does not exist');
            let user = docU.getContent();
            user._id = docU.key;

            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (!isPasswordMatched) throw new Error('Invalid login credentials');

            if (user.flag === 'P') {
                return user;
            } else {
                const docO = await collectionOrg.find().fetchArraySize(0).key(user.current_employer).getOne();
                if (docO) {
                    let contentO = docO.getContent();
                    contentO._id = docO.key;
                    user.current_employer = contentO;
                    if (!user.current_employer.active) {
                        throw new Error('Organization is not active.');
                    } else if (user.current_employer.isTrail) {
                        let date1 = new Date(user.current_employer.trail_end_date);
                        let date2 = new Date(Date.now());

                        let Difference_In_Time = date1.getTime() - date2.getTime();
                        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                        let daysLeft = Math.floor(Difference_In_Days);
                        daysLeft = daysLeft < 0 ? 0 : daysLeft;

                        if (daysLeft <= 0) user.current_employer.isDisabled = true;

                    }
                    return user;
                } else {
                    throw new Error('User Organization Not Found');
                }
            }

        } catch (e) {
            throw new Error(e.message);
        }
    },

    TagAllUser: async (role, org, collection) => {
        try {
            const doc = await collection.find().filter({ roles: { $nin: [role] }, current_employer: org }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let tempUser = document.getContent();
                    let roles = tempUser.roles ? tempUser.roles : [];
                    roles.push(role);
                    tempUser.roles = roles;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempUser);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserByRoles: async (roleList, org, userId, collection) => {
        try {
            let arr = [];
            let userDoc = await collection.find().fetchArraySize(0).key(userId).getOne();
            let tempUser = userDoc.getContent();
            if (roleList && roleList.length > 0) {
                let doc = await collection.find().filter({ current_employer: org, email: { $nin: [tempUser.email] }, roles: { $in: roleList } }).getDocuments();
                if (doc) doc.map(document => arr.push(document.key));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserByRole: async (role, org, collection) => {
        try {
            let arr = [];
            let doc = await collection.find().filter({ current_employer: org, userType: { $lt: 2 }, roles: { $in: [role] } }).getDocuments();
            if (doc) doc.map(document => arr.push(document.key));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserEI: async (org, arrId, collection) => {
        try {
            let arr = [];
            let doc;

            if (arrId && arrId.length > 0) {
                doc = await collection.find().filter({ current_employer: org, userType: { $lt: 2 }, email: { $nin: arrId } }).getDocuments();
            } else {
                doc = await collection.find().filter({ current_employer: org, userType: { $lt: 2 } }).getDocuments();
            }

            if (doc) doc.map(document => {
                let user = document.getContent();
                arr.push({ _id: document.key, email: user.email });
            });
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getProfile: async (key, collection, collectionOrg) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User profile not found');
            let user = doc.getContent();
            user._id = doc.key;

            if (user.flag === 'B') {
                const docO = await collectionOrg.find().fetchArraySize(0).key(user.current_employer).getOne();
                if (docO) {
                    let contentO = docO.getContent();
                    contentO._id = docO.key;
                    user.current_employer = contentO;
                    if (!user.current_employer.active) {
                        throw new Error('Organization is not active.');
                    } else if (user.current_employer.isTrail) {
                        let date1 = new Date(user.current_employer.trail_end_date);
                        let date2 = new Date(Date.now());

                        let Difference_In_Time = date1.getTime() - date2.getTime();
                        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                        let daysLeft = Math.floor(Difference_In_Days);
                        daysLeft = daysLeft < 0 ? 0 : daysLeft;

                        if (daysLeft <= 0) {
                            user.current_employer.isDisabled = true;
                        }
                    }
                }
            } else {
                if (user.isTrail) {
                    let date1 = new Date(user.trail_end_date);
                    let date2 = new Date(Date.now());

                    let Difference_In_Time = date1.getTime() - date2.getTime();
                    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                    let daysLeft = Math.floor(Difference_In_Days);
                    daysLeft = daysLeft < 0 ? 0 : daysLeft;

                    if (daysLeft <= 0) {
                        user.current_employer.isDisabled = true;
                    }
                }
            }
            [await generateProfileUrl(user), await generateLogoUrl(user)];
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateImage: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let user = docToReplace.getContent();
            user.image = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(user);

        } catch (e) {
            throw new Error(e.message);
        }
    },


    updateValue: async (key, field, value, collection, collectionOrg) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            var user = docToReplace.getContent();
            var pass;
            if (field === 'password') pass = await bcrypt.hash(value, 10);

            if (value || field === 'active' || field === 'clientView')
                switch (field) {
                    case 'name': user.name = value; break;
                    case 'email': user.email = value; break;
                    case 'password':
                        if (pass) user.password = pass; break;
                    case 'contact': user.contact = value; break;
                    case 'cnic': user.cnic = value; break;
                    case 'address': user.address = value; break;
                    case 'dob': user.dob = value; break;
                    case 'image': user.image = value; break;
                    case 'clientView': user.clientView = value; break;
                    case 'active': user.active = value; break;
                    case 'userT': user.userType = Number(value); break;
                    case 'storage':
                        if (Number(user.storageUploaded) < Number(value)) {
                            let strAv = Number(value) - Number(user.storageUploaded);
                            if (strAv < 0) strAv = 0;
                            user.storageLimit = Number(value);
                            user.storageAvailable = Number(strAv);
                        }
                        break;
                };

            await collection.find().fetchArraySize(0).key(key).replaceOne(user);

            if (user.flag === 'B') {
                const docO = await collectionOrg.find().fetchArraySize(0).key(user.current_employer).getOne();
                if (docO) {
                    let contentO = docO.getContent();
                    contentO._id = docO.key;
                    user.current_employer = contentO;
                    if (!user.current_employer.active) {
                        throw new Error('Organization is not active.');
                    } else if (user.current_employer.isTrail) {
                        let date1 = new Date(user.current_employer.trail_end_date);
                        let date2 = new Date(Date.now());

                        let Difference_In_Time = date1.getTime() - date2.getTime();
                        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                        let daysLeft = Math.floor(Difference_In_Days);
                        daysLeft = daysLeft < 0 ? 0 : daysLeft;

                        if (daysLeft <= 0) user.current_employer.isDisabled = true;
                    }
                }
            }

            user._id = docToReplace.key;
            [await generateProfileUrl(user), await generateLogoUrl(user)];
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User profile not found');
            let user = doc.getContent();
            user._id = doc.key;
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserCount: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ current_employer: org }).count();
            if (!doc) throw new Error('Employee count not found');
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserLimitDashR: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ $query: { current_employer: org }, $orderby: { created: -1 } }).limit(5).getDocuments();;
            let users = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteRoleMany: async (_id, collection) => {
        try {
            let docToReplace = await collection.find().filter({ roles: { $in: [_id] } }).getDocuments();
            if (docToReplace) await Promise.all(docToReplace.map(async doc => {
                let document = doc.getContent();
                document.category = document.category.filter(i => i !== _id);
                await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserCount: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ current_employer: _id }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserLimit: async (offset, _id, collection) => {
        try {
            let skipInNumber = Number(offset);
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { current_employer: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            let users = [];

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));

            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryCount: async (string, _id, type, collection) => {
        try {
            let user;
            if (type === 'email') user = await collection.find().filter({ current_employer: _id, email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else user = await collection.find().filter({ current_employer: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (!user) return 0;
            return user.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryLimit: async (offset, string, _id, type, collection) => {
        try {
            let skipInNumber = Number(offset);
            skipInNumber = skipInNumber * 12;

            let doc;
            if (type === 'email') doc = await collection.find().filter({ $query: { current_employer: _id, email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { current_employer: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            let users = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteUser: async (key, collection) => {
        try {
            await collection.find().key(key).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserByEmail: async (email, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ email: email }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserByName: async (email, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ email: email }).getOne();
            if (doc) {
                let user = doc.getContent();
                user._id = doc.key;
                return user;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserLimitDT: async (offset, _id, skipId, collection) => {
        try {
            let skipInNumber = Number(offset);
            skipInNumber = skipInNumber * 12;
            let doc;
            if (skipId) {
                let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                let email = '';
                if (user) {
                    let tempEmail = user.getContent();
                    email = tempEmail.email;
                }
                doc = await collection.find().filter({
                    $query: { current_employer: _id, userType: { $lte: 2 }, email: { $ne: email } },
                    $orderby: { created: -1 }
                }).skip(skipInNumber).limit(12).getDocuments();
            } else doc = await collection.find().filter({
                $query: { current_employer: _id, userType: { $lte: 2 } },
                $orderby: { created: -1 }
            }).skip(skipInNumber).limit(12).getDocuments();

            let users = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserCountDT: async (_id, skipId, collection) => {
        try {
            let doc;
            if (skipId) {
                let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                let email = '';
                if (user) {
                    let tempEmail = user.getContent();
                    email = [tempEmail.email];
                }
                doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: email } }).count();
            } else doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 } }).count();

            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserLimitDT: async (offset, _id, skipId, collection) => {
        try {
            let skipInNumber = Number(offset);
            skipInNumber = skipInNumber * 12;
            let doc;
            if (skipId) {
                let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                let email = '';
                if (user) {
                    let tempEmail = user.getContent();
                    email = [tempEmail.email];
                }
                doc = await collection.find().filter({
                    $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: email } },
                    $orderby: { created: -1 }
                }).skip(skipInNumber).limit(12).getDocuments();
            } else doc = await collection.find().filter({
                $query: { current_employer: _id, userType: { $lte: 2 } },
                $orderby: { created: -1 }
            }).skip(skipInNumber).limit(12).getDocuments();

            let users = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryCountDT: async (string, _id, skipId, type, collection) => {
        try {
            let doc;
            if (type === 'email') {
                if (skipId) {
                    let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                    let email = '';
                    if (user) {
                        let tempEmail = user.getContent();
                        email = [tempEmail.email];
                    }
                    doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: email }, email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                } else doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            } else {
                if (skipId) {
                    let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                    let email = '';
                    if (user) {
                        let tempEmail = user.getContent();
                        email = [tempEmail.email];
                    }
                    doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: email }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                } else doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            }
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryLimitDT: async (offset, string, _id, skipId, type, collection) => {
        try {
            let skipInNumber = Number(offset);
            skipInNumber = skipInNumber * 12;
            let doc;
            if (type === 'email') {
                if (skipId) {
                    let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                    let email = '';
                    if (user) {
                        let tempEmail = user.getContent();
                        email = [tempEmail.email];
                    }
                    doc = await collection.find().filter({
                        $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: email }, email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } },
                        $orderby: { created: -1 }
                    }).skip(skipInNumber).limit(12).getDocuments();
                } else doc = await collection.find().filter({
                    $query: { current_employer: _id, userType: { $lte: 2 }, email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } },
                    $orderby: { created: -1 }
                }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (skipId) {
                    let user = await collection.find().fetchArraySize(0).key(skipId).getOne();
                    let email = '';
                    if (user) {
                        let tempEmail = user.getContent();
                        email = [tempEmail.email];
                    }
                    doc = await collection.find().filter({
                        $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: email }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } },
                        $orderby: { created: -1 }
                    }).skip(skipInNumber).limit(12).getDocuments();
                } else doc = await collection.find().filter({
                    $query: { current_employer: _id, userType: { $lte: 2 }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } },
                    $orderby: { created: -1 }
                }).skip(skipInNumber).limit(12).getDocuments();
            }

            let users = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateStorage: async (key, sU, sA, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            var user = docToReplace.getContent();
            user.storageAvailable = Number(sA);
            user.storageUploaded = Number(sU);
            await collection.find().fetchArraySize(0).key(key).replaceOne(user);
        } catch (e) {
            throw new Error(e.meesage);
        }
    },

    updatePasswordByEmail: async (email, password, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).filter({ email: email }).getOne();
            if (!docToReplace) return false;
            var user = docToReplace.getContent();
            user.password = await bcrypt.hash(password, 10);
            await collection.find().fetchArraySize(0).key(docToReplace.key).replaceOne(user);
        } catch (e) {
            throw new Error(e.meesage);
        }
    },

    getAllUserSharedCountP: async (_id, arrId, uId, collection) => {
        try {
            var doc;
            if (arrId && arrId.length > 0) {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                arrId.push(userDoc.getContent().email);
                doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: arrId } }).count();
            } else {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                let email = [userDoc.getContent().email]
                doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: email } }).count();
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.meesage);
        }
    },

    getAllUserSharedLimitP: async (offsetN, _id, arrId, uId, collection) => {
        try {
            var users = [];
            var skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            if (arrId && arrId.length > 0) {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                arrId.push(userDoc.getContent().email);
                doc = await collection.find().filter({ $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: arrId } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                let email = [userDoc.getContent().email];
                doc = await collection.find().filter({ $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: email } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));

            return users;
        } catch (e) {
            throw new Error(e.meesage);
        }
    },

    getAllUserSharedQueryCountP: async (string, _id, arrId, uId, collection) => {
        try {
            var doc;
            if (arrId && arrId.length > 0) {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                arrId.push(userDoc.getContent().email);
                doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: arrId }, $or: [{ name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }).count();
            } else {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                let email = [userDoc.getContent().email]
                doc = await collection.find().filter({ current_employer: _id, userType: { $lte: 2 }, email: { $nin: email }, $or: [{ name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }).count();
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.meesage);
        }
    },

    getAllUserSharedQueryLimitP: async (offsetN, string, _id, arrId, uId, collection) => {
        try {
            var users = [];
            var skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            if (arrId && arrId.length > 0) {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                arrId.push(userDoc.getContent().email);
                doc = await collection.find().filter({ $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: arrId }, $or: [{ name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                let userDoc = await collection.find().fetchArraySize(0).key(uId).getOne();
                let email = [userDoc.getContent().email];
                doc = await collection.find().filter({ $query: { current_employer: _id, userType: { $lte: 2 }, email: { $nin: email }, $or: [{ name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { email: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));

            return users;
        } catch (e) {
            throw new Error(e.meesage);
        }
    },
}

async function generateProfileUrl(user) {
    var url = '';
    if (user && user.image && user.bucketName) url = await getPresignedUrl(user._id, user.image, user.bucketName)
    if (url) user.image = url;
}

async function generateLogoUrl(user) {
    var urlC = '';
    if (user && user.current_employer && user.current_employer.logo && user.current_employer.bucketName) urlC = await getPresignedUrl(user.current_employer._id, user.current_employer.logo, user.current_employer.bucketName)
    if (urlC) user.current_employer.logo = urlC;
}