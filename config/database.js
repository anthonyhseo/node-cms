module.exports = {
  mongoDbUrl:
    process.env.NODE_ENV === 'production'
      ? `mongodb://${process.env.MLAB_USER}:${
          process.env.MLAB_PASSWORD
        }@ds127139.mlab.com:27139/node-cms`
      : 'mongodb://localhost:27017/cms'
};
