const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  //Override me
  async afterCreate(ctx) {
    return "Hi"
  }
};