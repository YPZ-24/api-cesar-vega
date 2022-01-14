'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async getMessageUrl(ctx){
        try{
          const {encodeMessage} = ctx.request.body
          const {telefono} = await strapi.services['confg-whatsapp'].find()
          const urlMessage = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeMessage}`
    
          return {
            urlMessage
          }
        }catch(e){
          console.log(e)
          return new GraphqlError("Lo siento, ocurrio un error", 500) 
        }
      },

};
