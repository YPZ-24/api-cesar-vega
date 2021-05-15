const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

async function pay({CUSTOMER_ID, AMOUNT, PAYMENT_METHOD_ID}){
    const intent = await stripe.paymentIntents.create({
        amount: AMOUNT * 100,
        currency: 'MXN',
        customer: CUSTOMER_ID,
        payment_method: PAYMENT_METHOD_ID,
        payment_method_types: ['card'],
        //confirm: true
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
    return paymentMethods.data
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