const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  //Override me
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.user.create(data, { files });
    } else {
      entity = await strapi.services.user.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.user });
  }
};