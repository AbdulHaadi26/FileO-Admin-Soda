const common = require("oci-common");
const core = require("oci-core");
const os = require("oci-objectstorage");
// Using default configurations

const configurationFilePath = "./config";
const configProfile = "DEFAULT";

const provider = new common.ConfigFileAuthenticationDetailsProvider(
  configurationFilePath,
  configProfile
);

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider
});

client.region = common.Region.EU_FRANKFURT_1;

const namespace = 'frgk0srvtiib';
const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaws66hhstb5mifdfdoonfmjjqohokts5n56kblwyzbnkuwr2pzttq';


const updateBucketMain = async () => {
  try {
    
    const updateBucketDetails = {
      compartmentId: compartmentId
    };

    const bucketDetails = {
      namespaceName: namespace,
      bucketName: 'StorageOrganization',
      updateBucketDetails
    };

    const createBucketResponse = await client.updateBucket(bucketDetails);
    console.log(createBucketResponse);
    return createBucketResponse;
  } catch (e) {
    throw new Error(e.message);
  }
}


Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

const getPresignedUrl = async (name, objectName, subBucket) => {

  const createRequestDetails = {
    name: `${name}`,
    objectName: objectName,
    accessType: 'ObjectRead',
    timeExpires: new Date(Date.now()).addHours(1).toISOString()
  }

  const params = {
    namespaceName: namespace,
    bucketName: subBucket,
    createPreauthenticatedRequestDetails: createRequestDetails
  };

  const url = await client.createPreauthenticatedRequest(params);
  if (url && url.preauthenticatedRequest.accessUri) return `https://objectstorage.eu-frankfurt-1.oraclecloud.com${url.preauthenticatedRequest.accessUri}`;
  else throw new Error('The Presigned url could not be generated.');
}

const putPresignedUrl = async (name, objectName, subBucket) => {
  try {
    const createRequestDetails = {
      name: name,
      objectName: objectName,
      accessType: 'ObjectWrite',
      timeExpires: new Date(Date.now()).addHours(1).toISOString()
    }

    const params = {
      namespaceName: namespace,
      bucketName: subBucket,
      createPreauthenticatedRequestDetails: createRequestDetails
    };

    const url = await client.createPreauthenticatedRequest(params);
    if (url && url.preauthenticatedRequest.accessUri) return `https://objectstorage.eu-frankfurt-1.oraclecloud.com${url.preauthenticatedRequest.accessUri}`;
    else throw new Error('The Presigned url could not be generated.');
  } catch (e) {
    throw new Error(e.message);
  }
}

const copyObject = async (source, newName, subBucket) => {
  var copySourceDetails = {
    sourceObjectName: source,
    destinationRegion: 'eu-frankfurt-1',
    destinationNamespace: namespace,
    destinationBucket: subBucket,
    destinationObjectName: newName,
  }

  const copyObjectRequest = {
    namespaceName: namespace,
    bucketName: subBucket,
    copyObjectDetails: copySourceDetails
  };

  try {
    var copyUrl = await client.copyObject(copyObjectRequest);
    return copyUrl;
  } catch (e) {
    console.log(e.message);
    return null;
  }
}

const copyBasicDoc = async (source, newName, subBucket) => {
  var copySourceDetails = {
    sourceObjectName: source,
    destinationRegion: 'eu-frankfurt-1',
    destinationNamespace: namespace,
    destinationBucket: subBucket,
    destinationObjectName: newName,
  }

  const copyObjectRequest = {
    namespaceName: namespace,
    bucketName: 'File-O-Docs',
    copyObjectDetails: copySourceDetails
  };

  try {
    var copyUrl = await client.copyObject(copyObjectRequest);
    return copyUrl;
  } catch (e) {
    return null;
  }
}

const getBucketSize = async (bucket) => {
  const getBucketRequest = {
    namespaceName: namespace,
    bucketName: bucket,
    fields: ['approximateSize']
  };
  try {
    const getBucketResponse = await client.getBucket(getBucketRequest);
    return (getBucketResponse && getBucketResponse.bucket && getBucketResponse.bucket.approximateSize >= 0 ? getBucketResponse.bucket.approximateSize / (1024 * 1024 * 1024) : null);
  } catch (e) {
    return null;
  }
}

const deleteObject = async (name, subBucket) => {
  const deleteObjectRequest = {
    namespaceName: namespace,
    bucketName: subBucket,
    objectName: name
  };

  client.deleteObject(deleteObjectRequest, (err, data) => {
    return data;
  });
}

const createBucket = async (bucketName) => {
  try {
    const bucketDetails = {
      name: bucketName,
      compartmentId: compartmentId,
      autoTiering: 'InfrequentAccess'

    };
    const createBucketRequest = {
      namespaceName: namespace,
      createBucketDetails: bucketDetails
    };
    const createBucketResponse = await client.createBucket(createBucketRequest);
    return createBucketResponse;
  } catch (e) {
    throw new Error(e.message);
  }
}

const deleteBucket = async (bucketName) => {
  try {
    const deleteBucketRequest = {
      namespaceName: namespace,
      bucketName: bucketName
    };
    const deleteBucketResponse = await client.deleteBucket(deleteBucketRequest);
    return deleteBucketResponse;
  } catch (e) {
    throw new Error(e.message);
  }
}

module.exports = {
  getPresignedUrl,
  putPresignedUrl,
  deleteObject,
  copyObject,
  copyBasicDoc,
  getBucketSize,
  createBucket,
  deleteBucket
};