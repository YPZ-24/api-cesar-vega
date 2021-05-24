const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

async function pay({CUSTOMER_ID, AMOUNT, PAYMENT_METHOD_ID}){
    const intent = await stripe.paymentIntents.create({
        amount: AMOUNT * 100,
        currency: 'MXN',
        customer: CUSTOMER_ID,
        payment_method: PAYMENT_METHOD_ID,
        payment_method_types: ['card'],
        //confirm: true,
        //setup_future_usage: 'off_session'
    });
    if(intent.status === 'succeeded'){
        return intent
    }else{
        throw new Error('Error al realizar el pago, status: '+intent.status) 
    }
}

async function getCustomerCards({CUSTOMER_ID}){
    const paymentMethods = await stripe.paymentMethods.list({
        customer: CUSTOMER_ID,
        type: 'card',
    })
    const cards = paymentMethods.data.map(pm => {
        return {
            id: pm.id, 
            brand: pm.card.brand,
            last4: pm.card.last4
        }
    });
    return cards
}

async function generateCustomerId({CUSTOMER_EMAIL}){
    return await stripe.customers.create({
        email: CUSTOMER_EMAIL,
    });
}

module.exports = {
    pay,
    getCustomerCards,
    generateCustomerId
}